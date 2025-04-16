from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import cx_Oracle

from app.core.config import settings
from app.core.setup_oracle import setup_oracle_client

# Initialize Oracle client
try:
    setup_oracle_client()
except Exception as e:
    print(f"Warning: Oracle client initialization failed: {e}")
    print("This may be okay if Oracle client libraries are already configured.")

# Create Oracle engine
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Reconnect after 30 minutes
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()