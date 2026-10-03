import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL
engine = None

# Attempt to connect to configured DB (PostgreSQL by default)
# If PostgreSQL is not reachable, fall back to SQLite for instant out-of-the-box local operation
try:
    if DATABASE_URL.startswith("postgresql"):
        # Test connection with short timeout
        test_engine = create_engine(
            DATABASE_URL,
            connect_args={"connect_timeout": 3},
            pool_pre_ping=True
        )
        with test_engine.connect():
            pass
        engine = test_engine
        logger.info(f"Connected to PostgreSQL database: {DATABASE_URL.split('@')[-1]}")
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
        )
        logger.info(f"Connected to database: {DATABASE_URL}")
except Exception as e:
    fallback_url = "sqlite:///./lostfound.db"
    logger.warning(
        f"PostgreSQL connection to '{DATABASE_URL}' failed ({e}). "
        f"Falling back to local SQLite: {fallback_url} (Start Docker/Postgres to use PostgreSQL)"
    )
    engine = create_engine(
        fallback_url,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
