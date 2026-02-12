"""Database session management"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine, text
from contextlib import contextmanager
from config import get_settings
from models.database import Base

settings = get_settings()

# Create engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=settings.log_level == "DEBUG"
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database and create tables"""
    # Create vector extension if using PostgreSQL
    if "sqlite" not in settings.database_url:
        try:
            with engine.connect() as connection:
                connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                connection.commit()
                print("pgvector extension enabled")
        except Exception as e:
            print(f"Could not enable pgvector extension: {e}")
            
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully")


@contextmanager
def get_db() -> Session:
    """Get database session with context manager"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def get_db_session() -> Session:
    """Get database session for dependency injection"""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Will be closed by FastAPI
