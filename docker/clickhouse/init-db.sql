-- Inicialización de base de datos y esquema columnar para SonarIAR (SECOP I y SECOP II)

CREATE DATABASE IF NOT EXISTS radar_db;

-- Tabla optimizada para Licitaciones / Procesos de Contratación Pública
CREATE TABLE IF NOT EXISTS radar_db.licitaciones (
    id_proceso String,
    fuente LowCardinality(String),             -- 'SECOP_I' o 'SECOP_II'
    numero_proceso String,
    entidad String,
    nit_entidad String,
    departamento LowCardinality(String),
    municipio LowCardinality(String),
    estado LowCardinality(String),             -- 'Publicado', 'Adjudicado', 'Borrador', etc.
    modalidad LowCardinality(String),          -- 'Licitación pública', 'Selección abreviada', etc.
    tipo_contrato LowCardinality(String),      -- 'Obra', 'Servicios', 'Suministros', etc.
    objeto String,
    cuantia Float64,
    moneda LowCardinality(String) DEFAULT 'COP',
    fecha_publicacion DateTime,
    fecha_cierre Nullable(DateTime),
    fecha_adjudicacion Nullable(DateTime),
    url_proceso String,
    
    -- Campos enriquecidos por IA (LLM Worker)
    ai_resumen String DEFAULT '',
    ai_semaforo LowCardinality(String) DEFAULT 'PENDIENTE', -- 'VERDE', 'AMARILLO', 'ROJO', 'PENDIENTE'
    ai_pliegos_requisitos String DEFAULT '',                -- JSON o texto estructurado de exigencias clave
    ai_sectores Array(String) DEFAULT [],
    ai_matching_tags Array(String) DEFAULT [],
    
    -- Metadatos de ingesta
    actualizado_en DateTime DEFAULT now(),
    version UInt64 DEFAULT toUnixTimestamp(now())
)
ENGINE = ReplacingMergeTree(version)
PRIMARY KEY (id_proceso)
ORDER BY (id_proceso, fecha_publicacion, departamento);

-- Índices de salto (Skip indexes) para acelerar búsquedas de texto y filtros recurrentes
ALTER TABLE radar_db.licitaciones ADD INDEX IF NOT EXISTS idx_objeto objeto TYPE tokenbf_v1(10240, 2, 0) GRANULARITY 1;
ALTER TABLE radar_db.licitaciones ADD INDEX IF NOT EXISTS idx_entidad entidad TYPE set(100) GRANULARITY 2;
ALTER TABLE radar_db.licitaciones ADD INDEX IF NOT EXISTS idx_cuantia cuantia TYPE minmax GRANULARITY 2;
ALTER TABLE radar_db.licitaciones ADD INDEX IF NOT EXISTS idx_semaforo ai_semaforo TYPE set(10) GRANULARITY 1;

-- Tabla de Configuración de Proveedor de IA Dinámica
CREATE TABLE IF NOT EXISTS radar_db.configuracion_ia (
    key String,
    provider LowCardinality(String),           -- 'openai', 'deepseek', 'groq', 'anthropic', 'custom'
    api_key String,
    model String,
    base_url String DEFAULT '',
    temperature Float32 DEFAULT 0.2,
    actualizado_en DateTime DEFAULT now(),
    version UInt64 DEFAULT toUnixTimestamp(now())
)
ENGINE = ReplacingMergeTree(version)
PRIMARY KEY (key)
ORDER BY (key);

-- Insertar configuración por defecto inicial
INSERT INTO radar_db.configuracion_ia (key, provider, api_key, model, base_url, temperature)
VALUES ('default_ai', 'openai', '', 'gpt-4o-mini', 'https://api.openai.com/v1', 0.2);
