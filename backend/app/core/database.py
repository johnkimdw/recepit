from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base

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
    pool_size=20,        
    max_overflow=40,    
    pool_timeout=60,     
    pool_recycle=300     # Recycle connections every 5 minutes
)


# Add statement timeout event listener
# def set_session_timeout(dbapi_connection, connection_record):
#     cursor = dbapi_connection.cursor()
#     # cursor.execute("ALTER SESSION SET STATEMENT_TIMEOUT=30000")  # 30 seconds
    
#     # cursor.execute("ALTER SESSION SET '_ORACLE_SCRIPT'=TRUE")  # Enable extended Oracle features
#     cursor.execute("BEGIN DBMS_SESSION.SET_TIMEOUT(CALL_TIMEOUT, 30000); END;")  # 30 second timeout using PL/SQL
#     cursor.close()

# event.listen(engine, 'connect', set_session_timeout)

# Add monitoring listeners (optional)
@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    print(f"Connection checkout: {engine.pool.checkedin()}/{engine.pool.size()} available")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    print(f"Connection checkin: {engine.pool.checkedin()}/{engine.pool.size()} available")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()