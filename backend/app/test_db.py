import cx_Oracle
from app.core.config import settings
from app.core.setup_oracle import setup_oracle_client

def test_oracle_connection():
    try:
        # Set up Oracle client
        setup_oracle_client()
        
        # Create a connection string
        connection_string = f"{settings.DB_USER}/{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_SERVICE}"
        
        # Connect to Oracle
        connection = cx_Oracle.connect(connection_string)
        
        # Execute a simple query
        cursor = connection.cursor()
        cursor.execute("SELECT SYSDATE FROM DUAL")
        result = cursor.fetchone()
        
        print(f"Successfully connected to Oracle Database")
        print(f"Database date: {result[0]}")
        
        # Close connection
        cursor.close()
        connection.close()
        
        return True
    except Exception as e:
        print(f"Error connecting to Oracle Database: {e}")
        return False

if __name__ == "__main__":
    test_oracle_connection()