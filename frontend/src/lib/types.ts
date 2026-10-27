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
  codigo_unspsc?: string;
  duracion?: string;
  justificacion_modalidad?: string;
  documentos_tipo?: string;
  orden_entidad?: string;
  requisitos_habilitantes?: string;
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

export interface ReglaBusqueda {
  id?: string;
  empresa_id: string;
  nombre_regla: string;
  descripcion?: string;
  palabras_clave: string[];
  palabras_excluidas: string[];
  departamentos: string[];
  cuantia_minima: number;
  cuantia_maxima: number;
  semaforo_maximo: string;
  activa: boolean;
  coincidencias_count?: number;
}

export interface EmpresaSaas {
  id: string;
  nombre: string;
  nit: string;
  email_contacto: string;
  telefono?: string;
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  estado: 'ACTIVO' | 'SUSPENDIDO';
  total_reglas?: number;
  total_matches?: number;
}

export interface SuperAdminStats {
  total_empresas: number;
  empresas_activas: number;
  total_reglas_activas: number;
  total_licitaciones_analizadas: number;
  total_cruces_generados: number;
  distribucion_planes: Record<string, number>;
  ultimas_empresas: EmpresaSaas[];
}

export interface Notificacion {
  id: string;
  empresa_id: string;
  regla_id?: string;
  id_proceso: string;
  titulo: string;
  entidad: string;
  departamento: string;
  cuantia: number;
  ai_semaforo: string;
  match_score: number;
  match_reasons: string[];
  leida: boolean;
  created_at?: string;
}

export interface NotificacionesResponse {
  total: number;
  no_leidas: number;
  items: Notificacion[];
}
