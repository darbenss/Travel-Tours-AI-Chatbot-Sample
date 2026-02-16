import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
from pathlib import Path
import dotenv

# Determine the absolute path to .env file (one level up from server directory)
# server/config.py -> server/ -> project_root/.env
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# Load environment variables into os.environ for non-Pydantic usage if needed
dotenv.load_dotenv(ENV_PATH)


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

    app_url: str = os.getenv("APP_URL", "https://demo1.uprev.id")
    
    
    # Auth
    secret_key: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

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
