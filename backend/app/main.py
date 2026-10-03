import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import lost_items, found_items, matches, uploads, stats

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Full-stack Campus Lost and Found Platform API"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder to serve item images directly
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(lost_items.router)
app.include_router(found_items.router)
app.include_router(matches.router)
app.include_router(uploads.router)
app.include_router(stats.router)

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "database_backend": engine.name if engine else "unknown",
        "version": "1.0.0"
    }
