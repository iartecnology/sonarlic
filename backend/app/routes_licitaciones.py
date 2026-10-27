from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List, Set
from .schemas import LicitacionesResponse, LicitacionItem, FavoriteToggleRequest
from .db import get_clickhouse
from .auth import get_current_user, require_current_user, supabase

router = APIRouter(prefix="/licitaciones", tags=["Licitaciones"])

def _get_user_favorites(user_id: Optional[str]) -> Set[str]:
    """Consulta la lista de IDs de licitaciones favoritas del usuario en Supabase."""
    if not user_id:
        return set()
    try:
        res = supabase.table("favoritos").select("id_proceso").eq("user_id", user_id).execute()
        if res.data:
            return {item["id_proceso"] for item in res.data}
    except Exception:
        # Fallback silencioso si la tabla no está creada aún en Supabase
        pass
    return set()

@router.get("", response_model=LicitacionesResponse)
def list_licitaciones(
    q: Optional[str] = Query(None, description="Búsqueda por texto en objeto o entidad"),
    departamento: Optional[str] = Query(None, description="Filtrar por departamento"),
    semaforo: Optional[str] = Query(None, description="VERDE, AMARILLO o ROJO"),
    estado: Optional[str] = Query(None, description="Estado del proceso"),
    min_cuantia: Optional[float] = Query(None, ge=0),
    max_cuantia: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: Optional[dict] = Depends(get_current_user)
):
    """
    Búsqueda ultrarrápida en ClickHouse con inyección en memoria
    de favoritos del usuario logueado en Supabase.
    """
    ch = get_clickhouse()
    offset = (page - 1) * limit
    
    where_clauses = ["1=1"]
    params = {}
    
    if q:
        where_clauses.append("(ilike(objeto, %(q)s) OR ilike(entidad, %(q)s))")
        params["q"] = f"%{q}%"
        
    if departamento:
        where_clauses.append("departamento = %(departamento)s")
        params["departamento"] = departamento
        
    if semaforo:
        where_clauses.append("ai_semaforo = %(semaforo)s")
        params["semaforo"] = semaforo.upper()
        
    if estado:
        where_clauses.append("estado = %(estado)s")
        params["estado"] = estado
        
    if min_cuantia is not None:
        where_clauses.append("cuantia >= %(min_cuantia)s")
        params["min_cuantia"] = min_cuantia
        
    if max_cuantia is not None:
        where_clauses.append("cuantia <= %(max_cuantia)s")
        params["max_cuantia"] = max_cuantia
        
    where_sql = " AND ".join(where_clauses)
    
    # 1. Conteo total
    count_query = f"SELECT count() FROM radar_db.licitaciones FINAL WHERE {where_sql}"
    total = ch.command(count_query, parameters=params)
    
    # 2. Obtención de datos
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
        LIMIT {limit} OFFSET {offset}
    """
    
    rows = ch.query(data_query, parameters=params).result_rows
    col_names = [
        "id_proceso", "fuente", "numero_proceso", "entidad", "nit_entidad",
        "departamento", "municipio", "estado", "modalidad", "tipo_contrato",
        "objeto", "cuantia", "moneda", "fecha_publicacion", "fecha_cierre",
        "fecha_adjudicacion", "url_proceso", "ai_resumen", "ai_semaforo",
        "ai_pliegos_requisitos", "ai_sectores", "ai_matching_tags"
    ]
    
    # 3. TRUCO DE INYECCIÓN EN MEMORIA DE FAVORITOS
    user_id = user.get("sub") if user else None
    favorite_ids = _get_user_favorites(user_id)
    
    items: List[LicitacionItem] = []
    for r in rows:
        row_dict = dict(zip(col_names, r))
        row_dict["is_favorite"] = row_dict["id_proceso"] in favorite_ids
        items.append(LicitacionItem(**row_dict))
        
    return LicitacionesResponse(
        total=total,
        page=page,
        limit=limit,
        items=items
    )

@router.get("/{id_proceso}", response_model=LicitacionItem)
def get_licitacion_detail(id_proceso: str, user: Optional[dict] = Depends(get_current_user)):
    """Detalle completo de una licitación con semáforo y análisis de IA."""
    ch = get_clickhouse()
    query = """
        SELECT 
            id_proceso, fuente, numero_proceso, entidad, nit_entidad,
            departamento, municipio, estado, modalidad, tipo_contrato,
            objeto, cuantia, moneda, fecha_publicacion, fecha_cierre,
            fecha_adjudicacion, url_proceso, ai_resumen, ai_semaforo,
            ai_pliegos_requisitos, ai_sectores, ai_matching_tags
        FROM radar_db.licitaciones FINAL
        WHERE id_proceso = %(id)s
        LIMIT 1
    """
    res = ch.query(query, parameters={"id": id_proceso}).result_rows
    if not res:
        raise HTTPException(status_code=404, detail="Licitación no encontrada.")
        
    col_names = [
        "id_proceso", "fuente", "numero_proceso", "entidad", "nit_entidad",
        "departamento", "municipio", "estado", "modalidad", "tipo_contrato",
        "objeto", "cuantia", "moneda", "fecha_publicacion", "fecha_cierre",
        "fecha_adjudicacion", "url_proceso", "ai_resumen", "ai_semaforo",
        "ai_pliegos_requisitos", "ai_sectores", "ai_matching_tags"
    ]
    row_dict = dict(zip(col_names, res[0]))
    
    user_id = user.get("sub") if user else None
    favorite_ids = _get_user_favorites(user_id)
    row_dict["is_favorite"] = id_proceso in favorite_ids
    
    return LicitacionItem(**row_dict)

@router.post("/favoritos/toggle")
def toggle_favorite(payload: FavoriteToggleRequest, user: dict = Depends(require_current_user)):
    """Guarda o remueve una licitación de la lista de favoritos del usuario en Supabase."""
    user_id = user["sub"]
    try:
        if payload.favorito:
            supabase.table("favoritos").upsert({
                "user_id": user_id,
                "id_proceso": payload.id_proceso
            }).execute()
        else:
            supabase.table("favoritos").delete().eq("user_id", user_id).eq("id_proceso", payload.id_proceso).execute()
        return {"status": "ok", "id_proceso": payload.id_proceso, "is_favorite": payload.favorito}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando favoritos: {str(e)}")

@router.post("/sync")
def sync_licitaciones_soda(limit: int = 50):
    """
    Sincroniza directamente lotes de licitaciones de SECOP II desde Datos Abiertos Colombia
    usando las credenciales de la API SODA configuradas.
    """
    try:
        import sys
        sys.path.append("/app")
        from worker.tasks.celery_app import ingest_secop_ii_incremental
        result = ingest_secop_ii_incremental(limit=limit)
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
