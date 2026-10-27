export interface Licitacion {
  id_proceso: string;
  fuente: string;
  numero_proceso: string;
  entidad: string;
  nit_entidad?: string;
  departamento: string;
  municipio?: string;
  estado: string;
  modalidad?: string;
  tipo_contrato?: string;
  objeto: string;
  cuantia: number;
  moneda: string;
  fecha_publicacion: string;
  fecha_cierre?: string;
  fecha_adjudicacion?: string;
  url_proceso?: string;
  ai_resumen?: string;
  ai_semaforo?: 'VERDE' | 'AMARILLO' | 'ROJO' | 'PENDIENTE';
  ai_pliegos_requisitos?: string;
  ai_sectores?: string[];
  ai_matching_tags?: string[];
  is_favorite: boolean;
  match_score?: number;
  match_reasons?: string[];
}

export interface LicitacionesResponse {
  total: number;
  page: number;
  limit: number;
  items: Licitacion[];
}

export interface PerfilBusqueda {
  nombre_empresa?: string;
  nit?: string;
  palabras_clave: string[];
  palabras_excluidas: string[];
  departamentos: string[];
  cuantia_minima: number;
  cuantia_maxima: number;
  semaforo_maximo: string;
  notificar_email: boolean;
}
