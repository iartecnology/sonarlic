from datetime import datetime
from typing import Dict, Any, Optional

def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    # SODA suele enviar ISO 8601: "2024-05-15T10:30:00.000"
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str[:19], "%Y-%m-%dT%H:%M:%S")
        except Exception:
            continue
    return None

def normalize_secop_ii(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normaliza el esquema de un contrato del dataset SECOP II (jbjy-vk9h)
    al esquema columnar unificado de radar_db.licitaciones.
    """
    # ID Proceso unificado
    id_proceso = record.get("id_del_proceso") or record.get("referencia_del_proceso") or record.get("numero_de_proceso") or ""
    
    # Cuantía
    cuantia_raw = record.get("precio_base") or record.get("valor_total_estimado") or 0
    try:
        cuantia = float(cuantia_raw)
    except (ValueError, TypeError):
        cuantia = 0.0

    # Fechas
    fecha_pub = parse_date(record.get("fecha_de_publicacion_del")) or datetime.utcnow()
    fecha_cierre = parse_date(record.get("fecha_de_recepcion_de_respuestas") or record.get("fecha_de_cierre"))
    fecha_adj = parse_date(record.get("fecha_adjudicacion"))

    # URLs
    url_proceso = ""
    url_dict = record.get("urlproceso")
    if isinstance(url_dict, dict) and "url" in url_dict:
        url_proceso = url_dict["url"]
    elif isinstance(url_dict, str):
        url_proceso = url_dict

    return {
        "id_proceso": f"SECOP_II_{id_proceso}",
        "fuente": "SECOP_II",
        "numero_proceso": record.get("referencia_del_proceso") or record.get("numero_de_proceso") or "",
        "entidad": record.get("entidad") or record.get("nombre_de_la_entidad") or "",
        "nit_entidad": record.get("nit_entidad") or "",
        "departamento": record.get("departamento_entidad") or record.get("departamento") or "Colombia",
        "municipio": record.get("ciudad_entidad") or record.get("municipio") or "",
        "estado": record.get("estado_del_proceso") or record.get("fase") or "Publicado",
        "modalidad": record.get("modalidad_de_contratacion") or "",
        "tipo_contrato": record.get("tipo_de_contrato") or "",
        "objeto": record.get("descripcion_del_procedimiento") or record.get("objeto_a_contratar") or "",
        "cuantia": cuantia,
        "moneda": "COP",
        "fecha_publicacion": fecha_pub,
        "fecha_cierre": fecha_cierre,
        "fecha_adjudicacion": fecha_adj,
        "url_proceso": url_proceso,
        "ai_resumen": "",
        "ai_semaforo": "PENDIENTE",
        "ai_pliegos_requisitos": "",
        "ai_sectores": [],
        "ai_matching_tags": [],
        "actualizado_en": datetime.utcnow(),
        "version": int(datetime.utcnow().timestamp())
    }
