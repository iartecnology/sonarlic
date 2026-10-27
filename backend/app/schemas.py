from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class LicitacionItem(BaseModel):
    id_proceso: str
    fuente: str
    numero_proceso: str
    entidad: str
    nit_entidad: Optional[str] = None
    departamento: str
    municipio: Optional[str] = None
    estado: str
    modalidad: Optional[str] = None
    tipo_contrato: Optional[str] = None
    objeto: str
    cuantia: float
    moneda: str = "COP"
    fecha_publicacion: datetime
    fecha_cierre: Optional[datetime] = None
    fecha_adjudicacion: Optional[datetime] = None
    url_proceso: Optional[str] = None
    
    # Campos cognitivos de IA
    ai_resumen: Optional[str] = ""
    ai_semaforo: Optional[str] = "PENDIENTE"
    ai_pliegos_requisitos: Optional[str] = ""
    ai_sectores: List[str] = []
    ai_matching_tags: List[str] = []
    
    # Campo inyectado en memoria tras cruce con Supabase
    is_favorite: bool = False
    match_score: Optional[int] = None       # 0 a 100 de compatibilidad
    match_reasons: List[str] = []           # Razones de coincidencia


class LicitacionesResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[LicitacionItem]


class FavoriteToggleRequest(BaseModel):
    id_proceso: str
    favorito: bool


class PerfilBusquedaSchema(BaseModel):
    nombre_empresa: Optional[str] = ""
    nit: Optional[str] = ""
    palabras_clave: List[str] = Field(default=[], description="Palabras que buscas (ej: tecnología, papelería)")
    palabras_excluidas: List[str] = Field(default=[], description="Palabras que deseas descartar")
    departamentos: List[str] = Field(default=[], description="Departamentos de operación")
    cuantia_minima: float = 0.0
    cuantia_maxima: float = 1000000000.0
    semaforo_maximo: str = "AMARILLO"
    notificar_email: bool = True


class AIConfigSchema(BaseModel):
    provider: str = Field(..., description="openai, deepseek, groq, anthropic, ollama, custom")
    api_key: str = Field(..., description="API Key del proveedor")
    model: str = Field("gpt-4o-mini", description="Nombre del modelo (ej: gpt-4o-mini, deepseek-chat, llama-3.3-70b-versatile)")
    base_url: Optional[str] = Field("https://api.openai.com/v1", description="URL Base para proveedores compatibles con OpenAI")
    temperature: float = Field(0.2, ge=0.0, le=1.0)


class AIConfigResponse(BaseModel):
    provider: str
    api_key_masked: str
    model: str
    base_url: str
    temperature: float
    is_configured: bool
