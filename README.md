# SonarLIC — Radar de Licitaciones Inteligente (SaaS Multiplataforma)

Sistema SaaS para búsqueda, análisis predictivo y semaforización con IA de contratos públicos de **SECOP I y SECOP II** (vía SODA API - Datos Abiertos Colombia) enfocado en PYMEs.

---

## 🏗️ Arquitectura del Sistema

* **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Lucide Icons (Standalone multi-stage Docker).
* **Backend API Gateway:** FastAPI (Python 3.11) + Pydantic v2 + Validación JWT local Supabase + ClickHouse Connect.
* **Motor Analítico (OLAP):** ClickHouse (`ReplacingMergeTree` para deduplicación masiva y skip indexes de texto).
* **Data Worker:** Celery + Celery Beat + Redis (Ingesta incremental periódica y enriquecimiento con OpenAI/DeepSeek/Groq).
* **Base Transaccional (OLTP):** Supabase (PostgreSQL para Auth y favoritos del usuario).
* **Proxy Inverso:** NGINX / Traefik (Dokploy auto-SSL).

---

## 🚀 Despliegue en Dokploy

Dokploy permite dos modalidades de despliegue según tu preferencia:

### Opción 1: Despliegue Vía "Compose" en Dokploy (Recomendado)

1. En tu panel de Dokploy, ve a tu Proyecto y haz clic en **Create Service** -> **Compose**.
2. Nómbralo `sonarlic`.
3. En la pestaña **Source**, selecciona **Git Provider** (GitHub):
   * **Repository:** `iartecnology/sonarlic`
   * **Branch:** `main`
   * **Compose Path:** `./docker-compose.yml`
4. En la pestaña **Environment**, copia y pega el contenido de `.env.example` con tus credenciales reales:
   ```env
   CLICKHOUSE_USER=default
   CLICKHOUSE_PASSWORD=tu_password_seguro
   CLICKHOUSE_DB=radar_db
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_JWT_SECRET=tu-jwt-secret
   OPENAI_API_KEY=sk-proj-...
   NEXT_PUBLIC_API_URL=https://tu-dominio.com
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
5. Haz clic en **Deploy**. Dokploy compilará las imágenes multi-stage y levantará la red automáticamente.
6. Si usas el proxy Traefik integrado de Dokploy, puedes asignar el dominio directamente al servicio `frontend` (puerto 3000) o a `nginx` (puerto 80).

---

### Opción 2: Ejecución Local o VPS Directo (Docker Compose)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/iartecnology/sonarlic.git
   cd sonarlic
   ```

2. **Crear las variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

3. **Compilar y encender la infraestructura:**
   ```bash
   docker compose up --build -d
   ```

4. **Verificar el estado:**
   * **Web App:** `http://localhost`
   * **Swagger Docs:** `http://localhost/docs`
   * **Healthcheck:** `http://localhost/health`

---

## ⚙️ Esquema de ClickHouse

Al iniciar el contenedor de ClickHouse por primera vez, se ejecuta automáticamente el script en [`docker/clickhouse/init-db.sql`](docker/clickhouse/init-db.sql), creando:
* Base de datos `radar_db`.
* Tabla `radar_db.licitaciones` con motor `ReplacingMergeTree(version)`.
* Índices de salto de texto `idx_objeto` (`tokenbf_v1`), `idx_cuantia` (`minmax`), e `idx_semaforo`.

---

## 🔒 Tabla de Favoritos en Supabase (OLTP)

Para habilitar la funcionalidad de guardado de favoritos del usuario, crea en el SQL Editor de tu proyecto de Supabase:

```sql
create table public.favoritos (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    id_proceso text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, id_proceso)
);

-- Habilitar RLS
alter table public.favoritos enable row level security;

create policy "Los usuarios pueden gestionar sus favoritos"
on public.favoritos for all
using (auth.uid() = user_id);
```
