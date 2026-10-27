from pydantic_settings import BaseSettings
from typing import Optional


class WorkerSettings(BaseSettings):
    CLICKHOUSE_HOST: str = "clickhouse"
    CLICKHOUSE_PORT: int = 8123
    CLICKHOUSE_USER: str = "default"
    CLICKHOUSE_PASSWORD: str = "clickhouse_secure_pass_change_me"
    CLICKHOUSE_DB: str = "radar_db"
    
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Datos Abiertos Colombia SODA API
    SODA_DOMAIN: str = "www.datos.gov.co"
    SODA_APP_TOKEN: Optional[str] = "eZOwCRJJtQIaWjvGttYyPTdfh"
    SODA_APP_SECRET: Optional[str] = "dDKNrHCRmF6C9BVGoP8kFVEiWK9PFa1DHfU1"
    SODA_API_KEY: Optional[str] = "5548b0pbh9t3vqyjg4o157gwx"
    SODA_API_SECRET: Optional[str] = "20o4789z34rzf6q26x89233h60nqmo7brb715x51o5lbxe0g1k"
    
    # IDs de datasets oficiales de Colombia Compra Eficiente
    DATASET_SECOP_II: str = "jbjy-vk9h"  # Procesos de Contratación SECOP II
    DATASET_SECOP_I: str = "f7sd-wnpi"   # Procesos de Contratación SECOP I
    
    # OpenAI API Key para enriquecimiento
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = WorkerSettings()
