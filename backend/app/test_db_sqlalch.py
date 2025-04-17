# app/test_db_sqlalch.py
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.setup_oracle import setup_oracle_client


def test_sqlalchemy_connection():
    try:
        print("Attempting to connect to Oracle database with these settings:")
        print(f"User: {settings.DB_USER}")
        print(f"Host: {settings.DB_HOST}")
        print(f"Port: {settings.DB_PORT}")
        print(f"Service: {settings.DB_SERVICE}")
        print(f"Connection string: {settings.SQLALCHEMY_DATABASE_URI}")
        
        setup_oracle_client()
        
        # Create SQLAlchemy engine
        engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
        
        # Test connection by executing a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT SYSDATE FROM DUAL"))
            date = result.scalar()
            
            print(f"Successfully connected to Oracle Database using SQLAlchemy")
            print(f"Database date: {date}")
            
        return True
    except Exception as e:
        print(f"Error connecting to Oracle Database with SQLAlchemy: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    test_sqlalchemy_connection()