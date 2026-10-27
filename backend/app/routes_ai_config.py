from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from .schemas import AIConfigSchema, AIConfigResponse
from .db import get_clickhouse
from .config import settings

router = APIRouter(prefix="/config/ai", tags=["Configuración de IA"])

@router.get("", response_model=AIConfigResponse)
def get_ai_config():
    """Obtiene la configuración actual del proveedor de IA (con API Key enmascarada por seguridad)."""
    ch = get_clickhouse()
    query = "SELECT provider, api_key, model, base_url, temperature FROM radar_db.configuracion_ia FINAL WHERE key = 'default_ai' LIMIT 1"
    
    try:
        res = ch.query(query).result_rows
        if res:
            provider, api_key, model, base_url, temperature = res[0]
            masked_key = f"{api_key[:4]}...{api_key[-4:]}" if api_key and len(api_key) > 8 else ("***" if api_key else "")
            return AIConfigResponse(
                provider=provider or "openai",
                api_key_masked=masked_key,
                model=model or "gpt-4o-mini",
                base_url=base_url or "https://api.openai.com/v1",
                temperature=float(temperature or 0.2),
                is_configured=bool(api_key)
            )
    except Exception as e:
        pass
        
    return AIConfigResponse(
        provider="openai",
        api_key_masked="",
        model="gpt-4o-mini",
        base_url="https://api.openai.com/v1",
        temperature=0.2,
        is_configured=False
    )

@router.post("", response_model=AIConfigResponse)
def save_ai_config(payload: AIConfigSchema):
    """Guarda o actualiza el proveedor de IA y sus credenciales en ClickHouse."""
    ch = get_clickhouse()
    
    # Defaults de URL según el proveedor
    base_url = payload.base_url
    if not base_url:
        if payload.provider == "deepseek":
            base_url = "https://api.deepseek.com/v1"
        elif payload.provider == "groq":
            base_url = "https://api.groq.com/openai/v1"
        elif payload.provider == "openai":
            base_url = "https://api.openai.com/v1"
        else:
            base_url = "https://api.openai.com/v1"

    now = datetime.utcnow()
    version = int(now.timestamp())
    
    row = [[
        "default_ai",
        payload.provider,
        payload.api_key.strip(),
        payload.model.strip(),
        base_url.strip(),
        float(payload.temperature),
        now,
        version
    ]]
    
    cols = ["key", "provider", "api_key", "model", "base_url", "temperature", "actualizado_en", "version"]
    
    try:
        ch.insert("radar_db.configuracion_ia", row, column_names=cols)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando configuración de IA: {str(e)}")
        
    masked = f"{payload.api_key[:4]}...{payload.api_key[-4:]}" if len(payload.api_key) > 8 else "***"
    return AIConfigResponse(
        provider=payload.provider,
        api_key_masked=masked,
        model=payload.model,
        base_url=base_url,
        temperature=payload.temperature,
        is_configured=True
    )
