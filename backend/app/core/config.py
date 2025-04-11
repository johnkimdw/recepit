from pydantic import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-for-jwt"  
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Oracle Database settings for your EC2 instance
    DB_USER: str = "oralce"  # Default admin user, you might create a specific user for your app
    DB_PASSWORD: str = "1234"  # Set this in .env file
    DB_HOST: str = "172.22.135.245"  # If FastAPI runs on the same EC2 instance
    DB_PORT: str = "1521"       # Default Oracle port
    DB_SERVICE: str = "XE"      # XE is the service name for Oracle Express Edition
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"oracle+cx_oracle://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/?service_name={self.DB_SERVICE}"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Media settings
    MEDIA_ROOT: str = "media"
    RECIPE_IMAGES_DIR: str = "recipes"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()