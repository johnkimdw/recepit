from pydantic_settings import BaseSettings  
from typing import Optional, List
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    AWS_ACCESS_KEY: Optional[str] = os.getenv("AWS_ACCESS_KEY")
    AWS_SECRET_KEY: Optional[str] = os.getenv("AWS_SECRET_KEY")
    AWS_BUCKET_NAME: Optional[str] = os.getenv("AWS_BUCKET_NAME")
    AWS_REGION: Optional[str] = os.getenv("AWS_REGION")
    
    # Oracle Database settings for your EC2 instance
    DB_USER: str = os.getenv("DB_USER")          # oracle db user
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")           # need to set this in .env file
    DB_HOST: str = os.getenv("DB_HOST")     # vm ip address
    DB_PORT: str = os.getenv("DB_PORT")               # oracle port
    DB_SERVICE: str = os.getenv("DB_SERVICE")      
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"oracle+cx_oracle://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/?service_name={self.DB_SERVICE}"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:8081", 
        "http://127.0.0.1:8081",
        "exp://10.24.197.61:8081",  # Expo on iPhone
        "http://10.24.197.61:8081",  # HTTP on iPhone
        "http://10.24.197.61:8000",  # Backend direct access
        "exp://10.31.143.39:8081",
        "http://10.31.143.39:8081",
        "http://10.31.143.39:8000",
        # "*"  # Allow all origins temporarily for debugging
    ]
    
    # media settings
    MEDIA_ROOT: str = "media"
    RECIPE_IMAGES_DIR: str = "recipes"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()