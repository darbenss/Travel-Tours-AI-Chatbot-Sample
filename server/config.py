import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import dotenv

dotenv.load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # OpenRouter API Key (handles both Gemini and OpenAI models)
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY")
    
    # LangSmith Tracking
    langsmith_api_key: str = os.getenv("LANGSMITH_API_KEY")
    langsmith_project: str = os.getenv("LANGSMITH_PROJECT")
    langsmith_tracing: str = os.getenv("LANGSMITH_TRACING")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/uprev_db")
    
    # WhatsApp
    company_whatsapp: str = os.getenv("COMPANY_WHATSAPP")
    
    # CORS
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS")
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
