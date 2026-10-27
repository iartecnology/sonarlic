import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
from .config import settings

logger = logging.getLogger(__name__)

def enrich_licitacion_with_ai(licitacion: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analiza el pliego u objeto de la licitación con un LLM para generar:
    - ai_resumen: Resumen ejecutivo claro en 2 oraciones para PYMEs.
    - ai_semaforo: Nivel de viabilidad/complejidad técnica ('VERDE', 'AMARILLO', 'ROJO').
    - ai_pliegos_requisitos: Resumen estructurado de exigencias (experiencia, pólizas, capital).
    - ai_sectores: Etiquetas de industria (ej: 'Tecnología', 'Construcción', 'Alimentos').
    - ai_matching_tags: Palabras clave clave para match con perfiles de usuario.
    """
    if not settings.OPENAI_API_KEY:
        # Fallback si no hay API key configurada
        return {
            "ai_resumen": licitacion.get("objeto", "")[:200] + "...",
            "ai_semaforo": "VERDE",
            "ai_pliegos_requisitos": "Evaluación automatizada pendiente de API Key.",
            "ai_sectores": ["General"],
            "ai_matching_tags": [licitacion.get("modalidad", ""), licitacion.get("tipo_contrato", "")]
        }

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
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
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Devuelve exclusivamente JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
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
        logger.error(f"Error procesando enriquecimiento de IA: {e}")
        return {
            "ai_resumen": licitacion.get("objeto", "")[:200] + "...",
            "ai_semaforo": "AMARILLO",
            "ai_pliegos_requisitos": "Error procesando análisis inteligente.",
            "ai_sectores": [],
            "ai_matching_tags": []
        }
