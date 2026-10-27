from pydantic_settings import BaseSettings
from typing import Optional


class BackendSettings(BaseSettings):
    ENVIRONMENT: str = "development"
    
    # ClickHouse
    CLICKHOUSE_HOST: str = "clickhouse"
    CLICKHOUSE_PORT: int = 8123
    CLICKHOUSE_USER: str = "default"
    CLICKHOUSE_PASSWORD: str = "clickhouse_secure_pass_change_me"
    CLICKHOUSE_DB: str = "radar_db"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Supabase (OLTP / Auth)
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-anon-key"
    SUPABASE_JWT_SECRET: Optional[str] = "your-jwt-secret"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = BackendSettings()
