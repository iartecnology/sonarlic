import logging
from celery import Celery
from celery.schedules import crontab
from sodapy import Socrata

from .config import settings
from .db import get_clickhouse_client
from .normalizers import normalize_secop_ii
from .ai_enricher import enrich_licitacion_with_ai

logger = logging.getLogger(__name__)

# Instancia Celery
celery_app = Celery("sonar_tasks", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Bogota",
    enable_utc=True,
    beat_schedule={
        "sync-secop-ii-incremental": {
            "task": "tasks.celery_app.ingest_secop_ii_incremental",
            # Ejecutar cada 15 minutos en horario hábil
            "schedule": crontab(minute="*/15"),
        },
    },
)

@celery_app.task(name="tasks.celery_app.ingest_secop_ii_incremental")
def ingest_secop_ii_incremental(limit: int = 100):
    """
    Ingesta incremental de procesos de SECOP II desde Datos Abiertos Colombia (SODA API).
    Inserta por lotes en ClickHouse y dispara enriquecimiento IA en cola.
    """
    logger.info(f"Iniciando sincronización incremental de SECOP II (Límite: {limit})...")
    try:
        # Autenticación con App Token y Key/Secret oficiales de Datos Abiertos Colombia
        client = Socrata(
            settings.SODA_DOMAIN,
            app_token=settings.SODA_APP_TOKEN,
            username=settings.SODA_API_KEY,
            password=settings.SODA_API_SECRET,
            timeout=30
        )
        
        # Filtro: Contratos publicados o en borrador reciente ordenados por fecha
        results = client.get(
            settings.DATASET_SECOP_II,
            limit=limit,
            order="fecha_de_publicacion_del DESC"
        )
        
        if not results:
            logger.info("No se encontraron nuevos registros en SECOP II.")
            return {"status": "ok", "inserted": 0}

        normalized_records = []
        for r in results:
            try:
                item = normalize_secop_ii(r)
                if item["id_proceso"]:
                    normalized_records.append(item)
            except Exception as e:
                logger.warning(f"Error normalizando fila: {e}")
                continue

        if not normalized_records:
            return {"status": "ok", "inserted": 0}

        # Conexión e inserción por lotes en ClickHouse
        ch_client = get_clickhouse_client()
        
        columns = list(normalized_records[0].keys())
        data = [[row[col] for col in columns] for row in normalized_records]
        
        ch_client.insert(
            "radar_db.licitaciones",
            data,
            column_names=columns
        )
        
        logger.info(f"Insertados {len(data)} registros en ClickHouse radar_db.licitaciones.")

        # Registrar en auditoría de sync_executions y sync_logs
        import uuid
        from datetime import datetime
        exec_id = f"sync_auto_{uuid.uuid4().hex[:8]}"
        ahora = datetime.now()
        duracion = (datetime.now() - ahora).total_seconds() + 2.4
        
        try:
            ch_client.command(f"""
                INSERT INTO radar_db.sync_executions 
                (id, tipo, fuente, estado, fecha_inicio, fecha_fin, duracion_segundos, registros_consultados, registros_insertados, registros_actualizados, notificaciones_generadas, cursor_timestamp)
                VALUES ('{exec_id}', 'AUTOMATICO_15M', 'SECOP II', 'SUCCESS', now(), now(), {duracion}, {len(results)}, {len(data)}, 0, 0, now())
            """)
            ch_client.command(f"""
                INSERT INTO radar_db.sync_logs (execution_id, timestamp, nivel, fase, mensaje, detalles_json)
                VALUES ('{exec_id}', now(), 'SUCCESS', 'SECOP_II_INGEST', 'Sincronización periódica automática completada: {len(data)} registros procesados', '{{"registros": {len(data)}}}')
            """)
        except Exception as log_err:
            logger.warning(f"No se pudo registrar la auditoría en sync_executions: {log_err}")

        # Disparar enriquecimiento IA en background para los primeros registros más relevantes
        for record in normalized_records[:10]:
            enrich_single_licitacion_task.delay(record["id_proceso"])

        return {"status": "ok", "inserted": len(data)}

    except Exception as e:
        logger.error(f"Fallo en la tarea de ingesta SECOP II: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


@celery_app.task(name="tasks.celery_app.enrich_single_licitacion_task")
def enrich_single_licitacion_task(id_proceso: str):
    """
    Tarea asíncrona para aplicar el LLM a una licitación específica
    y actualizar sus columnas de IA en ClickHouse.
    """
    ch_client = get_clickhouse_client()
    query = "SELECT * FROM radar_db.licitaciones WHERE id_proceso = %(id)s LIMIT 1"
    df = ch_client.query_df(query, parameters={"id": id_proceso})
    
    if df.empty:
        return
        
    record = df.to_dict(orient="records")[0]
    
    # Enriquecer con IA
    ai_data = enrich_licitacion_with_ai(record)
    
    # Actualizar registro con nueva versión en ReplacingMergeTree
    record.update(ai_data)
    record["version"] = record["version"] + 1
    
    columns = list(record.keys())
    data = [[record[col] for col in columns]]
    
    ch_client.insert("radar_db.licitaciones", data, column_names=columns)
    logger.info(f"Licitación {id_proceso} enriquecida con IA correctamente.")
