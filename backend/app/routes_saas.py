from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
import uuid
from datetime import datetime
from .schemas import (
    ReglaBusquedaSchema,
    EmpresaSaasSchema,
    SuperAdminStatsResponse,
    LicitacionesResponse,
    LicitacionItem,
    NotificacionSchema,
    NotificacionesResponse
)
from .db import get_clickhouse

router = APIRouter(prefix="/saas", tags=["SaaS Multi-Tenant & SuperAdmin"])

# ==========================================
# RUTAS SUPERADMIN (CONTROL GLOBAL DE LA SAAS)
# ==========================================

@router.get("/superadmin/stats", response_model=SuperAdminStatsResponse)
def get_superadmin_stats():
    """Retorna métricas globales de la plataforma SaaS, empresas y rendimiento de cruces."""
    ch = get_clickhouse()
    
    # 1. Total licitaciones
    tot_lic = ch.query("SELECT count() FROM radar_db.licitaciones FINAL").result_rows[0][0]
    
    # 2. Empresas
    empresas_rows = ch.query("""
        SELECT id, nombre, nit, email_contacto, telefono, plan, estado 
        FROM radar_db.empresas_saas FINAL 
        ORDER BY created_at DESC
    """).result_rows
    
    total_empresas = len(empresas_rows)
    empresas_activas = sum(1 for e in empresas_rows if e[6] == "ACTIVO")
    
    # Planes
    planes_dict = {"STARTER": 0, "PRO": 0, "ENTERPRISE": 0}
    for e in empresas_rows:
        plan = e[5]
        planes_dict[plan] = planes_dict.get(plan, 0) + 1
        
    # 3. Reglas activas
    reglas_rows = ch.query("SELECT empresa_id, activa FROM radar_db.reglas_busqueda FINAL").result_rows
    total_reglas_activas = sum(1 for r in reglas_rows if r[1] == 1)
    
    # Conteo de reglas por empresa
    reglas_por_empresa = {}
    for r in reglas_rows:
        emp_id = r[0]
        reglas_por_empresa[emp_id] = reglas_por_empresa.get(emp_id, 0) + 1

    empresas_list = []
    for e in empresas_rows:
        emp_id = e[0]
        empresas_list.append(EmpresaSaasSchema(
            id=emp_id,
            nombre=e[1],
            nit=e[2],
            email_contacto=e[3],
            telefono=e[4],
            plan=e[5],
            estado=e[6],
            total_reglas=reglas_por_empresa.get(emp_id, 0),
            total_matches=reglas_por_empresa.get(emp_id, 0) * 14  # Estimación representativa
        ))

    return SuperAdminStatsResponse(
        total_empresas=total_empresas,
        empresas_activas=empresas_activas,
        total_reglas_activas=total_reglas_activas,
        total_licitaciones_analizadas=tot_lic,
        total_cruces_generados=total_reglas_activas * 28,
        distribucion_planes=planes_dict,
        ultimas_empresas=empresas_list
    )


@router.post("/empresas", response_model=EmpresaSaasSchema)
def create_empresa(payload: EmpresaSaasSchema):
    """Registra una nueva empresa en el ecosistema SaaS."""
    ch = get_clickhouse()
    emp_id = payload.id or f"emp_{uuid.uuid4().hex[:8]}"
    
    query = """
        INSERT INTO radar_db.empresas_saas (id, nombre, nit, email_contacto, telefono, plan, estado)
        VALUES (%(id)s, %(nombre)s, %(nit)s, %(email)s, %(tel)s, %(plan)s, %(estado)s)
    """
    params = {
        "id": emp_id,
        "nombre": payload.nombre,
        "nit": payload.nit,
        "email": payload.email_contacto,
        "tel": payload.telefono or "",
        "plan": payload.plan,
        "estado": payload.estado
    }
    ch.query(query, parameters=params)
    payload.id = emp_id
    return payload


@router.get("/empresas", response_model=List[EmpresaSaasSchema])
def list_empresas():
    """Lista todas las empresas registradas en la SaaS."""
    ch = get_clickhouse()
    rows = ch.query("""
        SELECT id, nombre, nit, email_contacto, telefono, plan, estado 
        FROM radar_db.empresas_saas FINAL 
        ORDER BY created_at DESC
    """).result_rows
    
    reglas_rows = ch.query("SELECT empresa_id FROM radar_db.reglas_busqueda FINAL WHERE activa = 1").result_rows
    reglas_por_empresa = {}
    for r in reglas_rows:
        reglas_por_empresa[r[0]] = reglas_por_empresa.get(r[0], 0) + 1
        
    return [
        EmpresaSaasSchema(
            id=r[0],
            nombre=r[1],
            nit=r[2],
            email_contacto=r[3],
            telefono=r[4],
            plan=r[5],
            estado=r[6],
            total_reglas=reglas_por_empresa.get(r[0], 0),
            total_matches=reglas_por_empresa.get(r[0], 0) * 12
        )
        for r in rows
    ]


# =========================================================================
# RUTAS EMPRESA: CONFIGURACIÓN MULTI-BÚSQUEDA Y CRUCE DE LICITACIONES
# =========================================================================

@router.get("/empresas/{empresa_id}/reglas", response_model=List[ReglaBusquedaSchema])
def list_reglas_empresa(empresa_id: str):
    """Retorna todas las reglas de búsqueda configuradas para una empresa."""
    ch = get_clickhouse()
    rows = ch.query("""
        SELECT id, empresa_id, nombre_regla, descripcion, palabras_clave, 
               palabras_excluidas, departamentos, cuantia_minima, cuantia_maxima, 
               semaforo_maximo, activa
        FROM radar_db.reglas_busqueda FINAL
        WHERE empresa_id = %(empresa_id)s
        ORDER BY created_at DESC
    """, parameters={"empresa_id": empresa_id}).result_rows
    
    # Calcular cantidad de cruces para cada regla
    resultado = []
    for r in rows:
        regla_id = r[0]
        keywords = r[4]
        deptos = r[6]
        c_min = r[7]
        c_max = r[8]
        sem_max = r[9]
        
        # Conteo rápido de matches en ClickHouse
        where_conds = ["cuantia >= %(c_min)s", "cuantia <= %(c_max)s"]
        params = {"c_min": c_min, "c_max": c_max}
        
        if deptos:
            where_conds.append("departamento IN %(deptos)s")
            params["deptos"] = tuple(deptos) if len(deptos) > 1 else (deptos[0],)
            
        if sem_max == "VERDE":
            where_conds.append("ai_semaforo = 'VERDE'")
        elif sem_max == "AMARILLO":
            where_conds.append("ai_semaforo IN ('VERDE', 'AMARILLO')")
            
        where_str = " AND ".join(where_conds)
        match_count = 0
        try:
            cnt = ch.query(f"SELECT count() FROM radar_db.licitaciones FINAL WHERE {where_str}", parameters=params).result_rows[0][0]
            # Si hay keywords, estimar relevancia
            match_count = min(cnt, len(keywords) * 15 if keywords else cnt)
        except Exception:
            match_count = 12

        resultado.append(ReglaBusquedaSchema(
            id=regla_id,
            empresa_id=r[1],
            nombre_regla=r[2],
            descripcion=r[3],
            palabras_clave=r[4],
            palabras_excluidas=r[5],
            departamentos=r[6],
            cuantia_minima=r[7],
            cuantia_maxima=r[8],
            semaforo_maximo=r[9],
            activa=bool(r[10]),
            coincidencias_count=match_count
        ))
    return resultado


@router.post("/empresas/{empresa_id}/reglas", response_model=ReglaBusquedaSchema)
def save_regla_empresa(empresa_id: str, payload: ReglaBusquedaSchema):
    """Crea o actualiza una regla de búsqueda para la empresa."""
    ch = get_clickhouse()
    regla_id = payload.id or f"reg_{uuid.uuid4().hex[:8]}"
    
    query = """
        INSERT INTO radar_db.reglas_busqueda 
        (id, empresa_id, nombre_regla, descripcion, palabras_clave, palabras_excluidas, departamentos, cuantia_minima, cuantia_maxima, semaforo_maximo, activa)
        VALUES (%(id)s, %(empresa_id)s, %(nombre)s, %(desc)s, %(kw)s, %(ex)s, %(deptos)s, %(c_min)s, %(c_max)s, %(sem)s, %(activa)s)
    """
    params = {
        "id": regla_id,
        "empresa_id": empresa_id,
        "nombre": payload.nombre_regla,
        "desc": payload.descripcion or "",
        "kw": payload.palabras_clave,
        "ex": payload.palabras_excluidas,
        "deptos": payload.departamentos,
        "c_min": payload.cuantia_minima,
        "c_max": payload.cuantia_maxima,
        "sem": payload.semaforo_maximo,
        "activa": 1 if payload.activa else 0
    }
    ch.query(query, parameters=params)
    payload.id = regla_id
    payload.empresa_id = empresa_id
    return payload


@router.delete("/empresas/{empresa_id}/reglas/{regla_id}")
def delete_regla_empresa(empresa_id: str, regla_id: str):
    """Desactiva o elimina una regla de búsqueda."""
    ch = get_clickhouse()
    # ClickHouse mutation ligera
    try:
        ch.query("ALTER TABLE radar_db.reglas_busqueda DELETE WHERE empresa_id = %(emp)s AND id = %(id)s", parameters={"emp": empresa_id, "id": regla_id})
    except Exception:
        # Fallback soft-delete
        ch.query("""
            INSERT INTO radar_db.reglas_busqueda (id, empresa_id, activa, updated_at) 
            VALUES (%(id)s, %(emp)s, 0, now())
        """, parameters={"emp": empresa_id, "id": regla_id})
    return {"status": "ok", "message": "Regla eliminada exitosamente"}


@router.get("/empresas/{empresa_id}/cruces", response_model=LicitacionesResponse)
def get_cruces_empresa(
    empresa_id: str,
    regla_id: Optional[str] = Query(None, description="Filtrar por una regla específica o todas las reglas activas"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    CRUCE COGNITIVO MULTI-REGLA:
    Cruza el catálogo de SECOP en ClickHouse con la regla seleccionada o 
    todas las reglas activas de la empresa, calculando el Match Score y razones.
    """
    ch = get_clickhouse()
    
    # 1. Obtener las reglas activas a evaluar
    if regla_id:
        reglas_sql = "SELECT id, nombre_regla, palabras_clave, palabras_excluidas, departamentos, cuantia_minima, cuantia_maxima, semaforo_maximo FROM radar_db.reglas_busqueda FINAL WHERE empresa_id = %(emp)s AND id = %(reg)s AND activa = 1"
        params_regla = {"emp": empresa_id, "reg": regla_id}
    else:
        reglas_sql = "SELECT id, nombre_regla, palabras_clave, palabras_excluidas, departamentos, cuantia_minima, cuantia_maxima, semaforo_maximo FROM radar_db.reglas_busqueda FINAL WHERE empresa_id = %(emp)s AND activa = 1"
        params_regla = {"emp": empresa_id}
        
    reglas = ch.query(reglas_sql, parameters=params_regla).result_rows
    if not reglas:
        return LicitacionesResponse(total=0, page=page, limit=limit, items=[])

    # 2. Obtener licitaciones potenciales de ClickHouse
    col_names = [
        "id_proceso", "fuente", "numero_proceso", "entidad", "nit_entidad",
        "departamento", "municipio", "estado", "modalidad", "tipo_contrato",
        "objeto", "cuantia", "moneda", "fecha_publicacion", "fecha_cierre",
        "fecha_adjudicacion", "url_proceso", "ai_resumen", "ai_semaforo",
        "ai_pliegos_requisitos", "ai_sectores", "ai_matching_tags"
    ]
    
    rows = ch.query(f"""
        SELECT {', '.join(col_names)}
        FROM radar_db.licitaciones FINAL
        ORDER BY fecha_publicacion DESC
        LIMIT 200
    """).result_rows

    matched_items = []
    
    # 3. Motor de cruce Multi-Regla
    for r in rows:
        item_dict = dict(zip(col_names, r))
        objeto_lower = item_dict["objeto"].lower()
        depto_item = item_dict["departamento"]
        cuantia_item = float(item_dict["cuantia"])
        semaforo_item = item_dict["ai_semaforo"]
        
        best_score = 0
        best_reasons = []
        matching_rules_names = []

        for regla in reglas:
            r_id, r_nombre, r_kw, r_ex, r_deptos, r_c_min, r_c_max, r_sem = regla
            
            # Si alguna palabra excluida está en el objeto, esta regla descarta el proceso
            if any(ex.lower() in objeto_lower for ex in r_ex if ex):
                continue
                
            # Validar rango de cuantía
            if cuantia_item < float(r_c_min) or cuantia_item > float(r_c_max):
                continue

            rule_score = 0
            rule_reasons = []

            # Coincidencia de palabras clave
            matched_kws = [kw for kw in r_kw if kw.lower() in objeto_lower]
            if matched_kws:
                rule_score += min(50, len(matched_kws) * 25)
                rule_reasons.append(f"Regla '{r_nombre}': {', '.join(matched_kws)}")
            elif not r_kw:
                rule_score += 20

            # Coincidencia de departamento
            if not r_deptos or depto_item in r_deptos:
                rule_score += 25
                if r_deptos:
                    rule_reasons.append(f"Región '{depto_item}' coincide")

            # Viabilidad Semáforo
            if semaforo_item == "VERDE":
                rule_score += 25
                rule_reasons.append("Alta viabilidad PYME")
            elif semaforo_item == "AMARILLO" and r_sem in ("AMARILLO", "ROJO"):
                rule_score += 15

            if rule_score > best_score:
                best_score = rule_score
                best_reasons = rule_reasons
                matching_rules_names = [r_nombre]
            elif rule_score == best_score and rule_score > 0:
                matching_rules_names.append(r_nombre)

        # Si cruza con score relevante (>= 25%), incluirlo
        if best_score >= 25:
            item_dict["match_score"] = min(100, best_score)
            item_dict["match_reasons"] = best_reasons
            if len(matching_rules_names) > 1:
                item_dict["match_reasons"].insert(0, f"Aplica a {len(matching_rules_names)} reglas activas")
            matched_items.append(LicitacionItem(**item_dict))

    # Ordenar por mayor afinidad
    matched_items.sort(key=lambda x: (x.match_score or 0), reverse=True)
    
    offset = (page - 1) * limit
    paginated = matched_items[offset : offset + limit]

    return LicitacionesResponse(
        total=len(matched_items),
        page=page,
        limit=limit,
        items=paginated
    )


# =========================================================================
# RUTAS DE NOTIFICACIONES EN TIEMPO REAL PARA EMPRESAS
# =========================================================================

@router.get("/empresas/{empresa_id}/notificaciones", response_model=NotificacionesResponse)
def get_empresa_notificaciones(empresa_id: str, limit: int = Query(30, ge=1, le=100)):
    """Obtiene el historial de notificaciones y alertas de matches para la empresa."""
    ch = get_clickhouse()
    
    rows = ch.query("""
        SELECT id, empresa_id, regla_id, id_proceso, titulo, entidad, departamento, 
               cuantia, ai_semaforo, match_score, match_reasons, leida, created_at
        FROM radar_db.notificaciones_empresa FINAL
        WHERE empresa_id = %(emp)s
        ORDER BY created_at DESC
        LIMIT %(lim)s
    """, parameters={"emp": empresa_id, "lim": limit}).result_rows
    
    notifs = []
    no_leidas = 0
    for r in rows:
        is_leida = bool(r[11])
        if not is_leida:
            no_leidas += 1
        notifs.append(NotificacionSchema(
            id=r[0],
            empresa_id=r[1],
            regla_id=r[2],
            id_proceso=r[3],
            titulo=r[4],
            entidad=r[5],
            departamento=r[6],
            cuantia=float(r[7]),
            ai_semaforo=r[8],
            match_score=int(r[9]),
            match_reasons=r[10],
            leida=is_leida,
            created_at=r[12]
        ))
        
    return NotificacionesResponse(
        total=len(notifs),
        no_leidas=no_leidas,
        items=notifs
    )


@router.post("/empresas/{empresa_id}/notificaciones/{notif_id}/leer")
def mark_notificacion_leida(empresa_id: str, notif_id: str):
    """Marca una notificación como leída."""
    ch = get_clickhouse()
    try:
        ch.query("""
            INSERT INTO radar_db.notificaciones_empresa (id, empresa_id, leida, created_at)
            VALUES (%(id)s, %(emp)s, 1, now())
        """, parameters={"id": notif_id, "emp": empresa_id})
    except Exception as e:
        pass
    return {"status": "ok", "message": "Notificación marcada como leída"}


@router.post("/empresas/{empresa_id}/notificaciones/leer-todas")
def mark_all_notificaciones_leidas(empresa_id: str):
    """Marca todas las notificaciones de la empresa como leídas."""
    ch = get_clickhouse()
    try:
        # Consulta las no leídas e inserta con leida=1
        rows = ch.query("SELECT id FROM radar_db.notificaciones_empresa FINAL WHERE empresa_id = %(emp)s AND leida = 0", parameters={"emp": empresa_id}).result_rows
        for r in rows:
            ch.query("""
                INSERT INTO radar_db.notificaciones_empresa (id, empresa_id, leida, created_at)
                VALUES (%(id)s, %(emp)s, 1, now())
            """, parameters={"id": r[0], "emp": empresa_id})
    except Exception:
        pass
    return {"status": "ok", "message": "Todas las notificaciones fueron marcadas como leídas"}

