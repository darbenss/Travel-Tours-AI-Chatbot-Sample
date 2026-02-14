"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.chat import router as chat_router
from api.bookings import router as bookings_router
from api.packages import router as packages_router
from db.session import init_db
from config import get_settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="UpRev AI Sales Agent",
    description="AI-powered travel package recommendation and booking assistant",
    version="1.0.0"
)

# Configure CORS
origins = settings.allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(bookings_router, prefix="/api", tags=["Bookings"])
app.include_router(packages_router, prefix="/api", tags=["Packages"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("🚀 Starting Travel AI Sales Agent...")
    logger.info(f"📊 LangSmith Tracking: {settings.langsmith_tracing}")
    init_db()
    logger.info("🌱 Seeding database...")
    try:
        from db.seed_data import seed_packages
        seed_packages()
        logger.info("✅ Database seeding completed!")
    except Exception as e:
        logger.error(f"❌ Database seeding failed: {e}")
    logger.info("✅ Application started successfully!")


@app.get("/")
async def root():
    """Health check"""
    return {"message": "Travel AI Sales Agent API is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
