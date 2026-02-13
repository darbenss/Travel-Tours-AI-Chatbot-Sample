import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
import dotenv

dotenv.load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # OpenRouter API Key (handles both Gemini and OpenAI models)
    openrouter_api_key: Optional[str] = None
    
    # LangSmith Tracking
    langsmith_api_key: Optional[str] = None
    langsmith_project: Optional[str] = None
    langsmith_tracing: Optional[str] = None
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/uprev_db")
    
    # WhatsApp
    company_whatsapp: Optional[str] = None
    
    # CORS
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    app_url: str = os.getenv("APP_URL", "https://api.uprev.id")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    try:
        return Settings()
    except Exception as e:
        import sys
        print(f"❌ CONFIGURATION ERROR: {e}", file=sys.stderr)
        raise e
