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


class LicitacionesResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[LicitacionItem]


class FavoriteToggleRequest(BaseModel):
    id_proceso: str
    favorito: bool
