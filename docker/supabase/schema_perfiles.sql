-- ==============================================================================
-- SonarLIC: Tablas de Perfil de Contratación y Oportunidades Personalizadas
-- Ejecutar en el SQL Editor de tu proyecto de Supabase
-- ==============================================================================

-- 1. Tabla de Perfil de Búsqueda de la Empresa / PYME
CREATE TABLE IF NOT EXISTS public.perfiles_busqueda (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    nombre_empresa TEXT DEFAULT '',
    nit TEXT DEFAULT '',
    palabras_clave TEXT[] NOT NULL DEFAULT '{}',
    palabras_excluidas TEXT[] DEFAULT '{}',
    departamentos TEXT[] NOT NULL DEFAULT '{}',
    cuantia_minima NUMERIC DEFAULT 0,
    cuantia_maxima NUMERIC DEFAULT 1000000000,
    semaforo_maximo TEXT DEFAULT 'AMARILLO', -- 'VERDE', 'AMARILLO', 'ROJO'
    notificar_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en perfiles_busqueda
ALTER TABLE public.perfiles_busqueda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil de busqueda"
ON public.perfiles_busqueda FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar o actualizar su propio perfil de busqueda"
ON public.perfiles_busqueda FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Tabla de Favoritos del Usuario
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    id_proceso TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, id_proceso)
);

-- Habilitar RLS en favoritos
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios gestionan sus favoritos"
ON public.favoritos FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Tabla de Oportunidades Descartadas (Para no volver a mostrarlas en su feed)
CREATE TABLE IF NOT EXISTS public.oportunidades_descartadas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    id_proceso TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, id_proceso)
);

ALTER TABLE public.oportunidades_descartadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios gestionan sus descartados"
ON public.oportunidades_descartadas FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
