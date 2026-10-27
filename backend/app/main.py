from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes_licitaciones import router as licitaciones_router
from .routes_ai_config import router as ai_config_router
from .routes_perfil import router as perfil_router
from .db import get_clickhouse

app = FastAPI(
    title="SonarLIC API - Radar de Licitaciones Inteligente",
    description="API Gateway para búsqueda analítica en ClickHouse, enriquecimiento IA y autenticación Supabase.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware para Next.js y React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Rutas
app.include_router(licitaciones_router, prefix="/api/v1")
app.include_router(ai_config_router, prefix="/api/v1")
app.include_router(perfil_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
def health_check():
    """Verifica estado de salud del backend y conexión con ClickHouse"""
    ch_status = "ok"
    try:
        ch = get_clickhouse()
        ch.command("SELECT 1")
    except Exception as e:
        ch_status = f"error: {str(e)}"
        
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "clickhouse": ch_status
    }
