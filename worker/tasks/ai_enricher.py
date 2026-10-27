import json
import logging
from typing import Dict, Any, List, Optional
from openai import OpenAI
from .config import settings
from .db import get_clickhouse_client

logger = logging.getLogger(__name__)

def get_active_ai_config() -> Dict[str, Any]:
    """
    Lee la configuración del proveedor de IA guardada dinámicamente en ClickHouse.
    Si no existe o está vacía, recurre a las variables de entorno.
    """
    try:
        ch = get_clickhouse_client()
        query = "SELECT provider, api_key, model, base_url, temperature FROM radar_db.configuracion_ia FINAL WHERE key = 'default_ai' LIMIT 1"
        res = ch.query(query).result_rows
        if res:
            provider, api_key, model, base_url, temperature = res[0]
            if api_key:
                return {
                    "provider": provider,
                    "api_key": api_key,
                    "model": model or "gpt-4o-mini",
                    "base_url": base_url or ("https://api.openai.com/v1" if provider == "openai" else None),
                    "temperature": float(temperature or 0.2)
                }
    except Exception as e:
        logger.warning(f"No se pudo leer configuracion_ia de ClickHouse: {e}")

    # Fallback a settings (.env)
    return {
        "provider": "openai",
        "api_key": settings.OPENAI_API_KEY or "",
        "model": "gpt-4o-mini",
        "base_url": "https://api.openai.com/v1",
        "temperature": 0.2
    }


def enrich_licitacion_with_ai(licitacion: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analiza el pliego u objeto de la licitación con el LLM configurado en la plataforma.
    Soporta OpenAI, DeepSeek, Groq, Ollama y APIs compatibles con OpenAI.
    """
    ai_conf = get_active_ai_config()
    api_key = ai_conf.get("api_key")

    if not api_key:
        return {
            "ai_resumen": licitacion.get("objeto", "")[:200] + "...",
            "ai_semaforo": "VERDE",
            "ai_pliegos_requisitos": "Configura tu Proveedor de IA en la plataforma para análisis detallado de pliegos.",
            "ai_sectores": ["General"],
            "ai_matching_tags": [licitacion.get("modalidad", ""), licitacion.get("tipo_contrato", "")]
        }

    base_url = ai_conf.get("base_url") or "https://api.openai.com/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)
    model = ai_conf.get("model") or "gpt-4o-mini"
    temperature = ai_conf.get("temperature", 0.2)
    
    prompt = f"""
    Eres un analista experto en contratación pública (SECOP) en Colombia para PYMEs.
    Analiza la siguiente oportunidad de negocio y devuelve ÚNICAMENTE un objeto JSON válido.

    DETALLES DE LA LICITACIÓN:
    Entidad: {licitacion.get('entidad')}
    Objeto: {licitacion.get('objeto')}
    Modalidad: {licitacion.get('modalidad')}
    Tipo de Contrato: {licitacion.get('tipo_contrato')}
    Cuantía (COP): {licitacion.get('cuantia')}
    Departamento: {licitacion.get('departamento')}

    SCHEMA REQUERIDO (JSON puro, sin markdown ni backticks):
    {{
        "ai_resumen": "Resumen conciso y claro de 2 oraciones sobre qué busca la entidad.",
        "ai_semaforo": "VERDE" | "AMARILLO" | "ROJO" (Verde = accesible para pymes/requisitos estándar, Amarillo = media complejidad, Rojo = alta complejidad o hiperespecializado),
        "ai_pliegos_requisitos": "Puntos clave de cumplimiento (experiencia mínima esperada, capacidad operativa).",
        "ai_sectores": ["Sector 1", "Sector 2"],
        "ai_matching_tags": ["tag1", "tag2", "tag3", "tag4"]
    }}
    """

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Devuelve exclusivamente JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return {
            "ai_resumen": data.get("ai_resumen", ""),
            "ai_semaforo": data.get("ai_semaforo", "VERDE"),
            "ai_pliegos_requisitos": data.get("ai_pliegos_requisitos", ""),
            "ai_sectores": data.get("ai_sectores", []),
            "ai_matching_tags": data.get("ai_matching_tags", [])
        }
    except Exception as e:
        logger.error(f"Error procesando enriquecimiento con proveedor {ai_conf.get('provider')}: {e}")
        return {
            "ai_resumen": licitacion.get("objeto", "")[:200] + "...",
            "ai_semaforo": "AMARILLO",
            "ai_pliegos_requisitos": f"Error al procesar con IA: {str(e)}",
            "ai_sectores": [],
            "ai_matching_tags": []
        }
