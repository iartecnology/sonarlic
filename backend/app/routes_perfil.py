from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict, Any
from .schemas import PerfilBusquedaSchema, LicitacionesResponse, LicitacionItem
from .auth import get_current_user, require_current_user, supabase
from .db import get_clickhouse

router = APIRouter(prefix="/perfil", tags=["Perfil de Contratación & Radar"])

@router.get("", response_model=PerfilBusquedaSchema)
def get_user_profile(user: Optional[dict] = Depends(get_current_user)):
    """Obtiene el perfil de contratación de la PYME desde Supabase o devuelve plantilla por defecto."""
    user_id = user.get("sub") if user else None
    if user_id:
        try:
            res = supabase.table("perfiles_busqueda").select("*").eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                return PerfilBusquedaSchema(**res.data[0])
        except Exception as e:
            pass

    # Perfil por defecto (o modo demo / invitado)
    return PerfilBusquedaSchema(
        nombre_empresa="Mi Empresa PYME",
        nit="900123456-1",
        palabras_clave=["Salud", "Suministro", "Mantenimiento"],
        palabras_excluidas=[],
        departamentos=["Distrito Capital de Bogotá", "Antioquia", "Bolívar", "Norte de Santander"],
        cuantia_minima=0,
        cuantia_maxima=1000000000,
        semaforo_maximo="AMARILLO",
        notificar_email=True
    )

@router.post("", response_model=PerfilBusquedaSchema)
def save_user_profile(payload: PerfilBusquedaSchema, user: Optional[dict] = Depends(get_current_user)):
    """Crea o actualiza los criterios de búsqueda de licitaciones de la PYME."""
    user_id = user.get("sub") if user else "guest_user"
    data = payload.dict()
    data["user_id"] = user_id

    if user_id != "guest_user":
        try:
            supabase.table("perfiles_busqueda").upsert(data, on_conflict="user_id").execute()
        except Exception as e:
            pass
    return payload

@router.get("/mis-oportunidades", response_model=LicitacionesResponse)
def get_my_opportunities(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: Optional[dict] = Depends(get_current_user)
):
    """
    Feed inteligente: calcula en tiempo real el match cognitivo entre el perfil
    del usuario (Supabase o Demo) y el catálogo masivo de licitaciones (ClickHouse).
    """
    user_id = user.get("sub") if user else None
    
    # 1. Obtener perfil del usuario
    profile = None
    if user_id:
        try:
            profile_res = supabase.table("perfiles_busqueda").select("*").eq("user_id", user_id).execute()
            if profile_res.data:
                profile = profile_res.data[0]
        except Exception:
            profile = None

    if not profile:
        # Perfil demo activo con criterios representativos para exploración inmediata
        profile = {
            "palabras_clave": ["Salud", "Servicios", "Apoyo", "Mantenimiento"],
            "palabras_excluidas": [],
            "departamentos": ["Distrito Capital de Bogotá", "Norte de Santander", "Amazonas", "Bolívar", "Antioquia"],
            "cuantia_minima": 0,
            "cuantia_maxima": 1000000000,
            "semaforo_maximo": "AMARILLO"
        }
        
    keywords = [k.strip() for k in profile.get("palabras_clave", []) if k.strip()]
    excluded = [e.strip() for e in profile.get("palabras_excluidas", []) if e.strip()]
    departamentos = profile.get("departamentos", [])
    cuantia_min = float(profile.get("cuantia_minima") or 0)
    cuantia_max = float(profile.get("cuantia_maxima") or 1000000000)
    semaforo_max = profile.get("semaforo_maximo", "AMARILLO")

    # Si no tiene palabras clave configuradas, sugerirle configurar su perfil
    if not keywords and not departamentos:
        return LicitacionesResponse(total=0, page=page, limit=limit, items=[])

    # 2. Construir query en ClickHouse
    ch = get_clickhouse()
    where_conditions = ["1=1"]
    params = {}

    # Filtro de departamentos
    if departamentos:
        where_conditions.append("departamento IN %(deptos)s")
        params["deptos"] = tuple(departamentos) if len(departamentos) > 1 else (departamentos[0],)

    # Filtro de cuantía
    where_conditions.append("cuantia >= %(c_min)s AND cuantia <= %(c_max)s")
    params["c_min"] = cuantia_min
    params["c_max"] = cuantia_max

    # Filtro de palabras excluidas
    for i, ex in enumerate(excluded):
        key = f"ex_{i}"
        where_conditions.append(f"NOT ilike(objeto, %({key})s)")
        params[key] = f"%{ex}%"

    # Filtro de semáforo
    if semaforo_max == "VERDE":
        where_conditions.append("ai_semaforo = 'VERDE'")
    elif semaforo_max == "AMARILLO":
        where_conditions.append("ai_semaforo IN ('VERDE', 'AMARILLO')")

    where_sql = " AND ".join(where_conditions)

    # Consulta a ClickHouse
    data_query = f"""
        SELECT 
            id_proceso, fuente, numero_proceso, entidad, nit_entidad,
            departamento, municipio, estado, modalidad, tipo_contrato,
            objeto, cuantia, moneda, fecha_publicacion, fecha_cierre,
            fecha_adjudicacion, url_proceso, ai_resumen, ai_semaforo,
            ai_pliegos_requisitos, ai_sectores, ai_matching_tags
        FROM radar_db.licitaciones FINAL
        WHERE {where_sql}
        ORDER BY fecha_publicacion DESC
        LIMIT 200
    """

    rows = ch.query(data_query, parameters=params).result_rows
    col_names = [
        "id_proceso", "fuente", "numero_proceso", "entidad", "nit_entidad",
        "departamento", "municipio", "estado", "modalidad", "tipo_contrato",
        "objeto", "cuantia", "moneda", "fecha_publicacion", "fecha_cierre",
        "fecha_adjudicacion", "url_proceso", "ai_resumen", "ai_semaforo",
        "ai_pliegos_requisitos", "ai_sectores", "ai_matching_tags"
    ]

    # 3. Obtener favoritos del usuario
    favorite_ids = set()
    if user_id:
        try:
            fav_res = supabase.table("favoritos").select("id_proceso").eq("user_id", user_id).execute()
            if fav_res.data:
                favorite_ids = {f["id_proceso"] for f in fav_res.data}
        except Exception:
            favorite_ids = set()

    # 4. Cálculo del Match Score en Memoria (0 - 100)
    matched_items = []
    for r in rows:
        item_dict = dict(zip(col_names, r))
        objeto_lower = item_dict["objeto"].lower()
        tags_lower = [t.lower() for t in item_dict.get("ai_matching_tags", [])]

        score = 0
        reasons = []

        # Puntuación por Palabras Clave (Máximo 50 puntos)
        matched_kw = [kw for kw in keywords if kw.lower() in objeto_lower or any(kw.lower() in t for t in tags_lower)]
        if matched_kw:
            score += min(50, len(matched_kw) * 25)
            reasons.append(f"Coincide con: {', '.join(matched_kw)}")

        # Puntuación por Departamento (25 puntos)
        if item_dict["departamento"] in departamentos:
            score += 25
            reasons.append(f"Ubicado en {item_dict['departamento']}")

        # Puntuación por Semáforo Viable (25 puntos)
        if item_dict["ai_semaforo"] == "VERDE":
            score += 25
            reasons.append("Alta viabilidad PYME")
        elif item_dict["ai_semaforo"] == "AMARILLO":
            score += 15

        # Si supera el umbral de interés (mínimo 25%), lo añadimos
        if score >= 25 or not keywords:
            item_dict["match_score"] = min(100, score)
            item_dict["match_reasons"] = reasons
            item_dict["is_favorite"] = item_dict["id_proceso"] in favorite_ids
            matched_items.append(LicitacionItem(**item_dict))

    # Ordenar por mayor score de coincidencia
    matched_items.sort(key=lambda x: (x.match_score or 0), reverse=True)

    # Paginación
    offset = (page - 1) * limit
    paginated_items = matched_items[offset : offset + limit]

    return LicitacionesResponse(
        total=len(matched_items),
        page=page,
        limit=limit,
        items=paginated_items
    )
