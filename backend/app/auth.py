from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
import jwt
from supabase import create_client, Client
from .config import settings

# Cliente Supabase singleton
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """
    Extrae y valida el JWT emitido por Supabase Auth.
    Permite llamadas anónimas devolviendo None si no hay encabezado de autenticación.
    """
    if not authorization:
        return None
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Encabezado de autorización inválido. Debe ser 'Bearer <token>'"
        )
    
    token = parts[1]
    
    # 1. Validación local rápida de firma JWT si se configuró el secret (Cero latencia)
    if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "your-jwt-secret":
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            return payload
        except jwt.PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token JWT inválido o expirado: {str(e)}"
            )
            
    # 2. Validación remota vía cliente Supabase si el secret local no está disponible
    try:
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "sub": user_response.user.id,
                "email": user_response.user.email,
                "user_metadata": user_response.user.user_metadata or {}
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticación con Supabase fallida."
        )

    return None

def require_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Exige usuario autenticado para rutas protegidas"""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Acceso denegado: Autenticación requerida."
        )
    return user
