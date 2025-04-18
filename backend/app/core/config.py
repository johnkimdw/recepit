from pydantic_settings import BaseSettings  
from typing import Optional, List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-for-jwt"  
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Oracle Database settings for your EC2 instance
    DB_USER: str = "test_user1"         # oracle db user
    DB_PASSWORD: str = "1234"           # need to set this in .env file
    DB_HOST: str = "54.152.153.232"     # vm ip address
    DB_PORT: str = "1539"               # oracle port
    DB_SERVICE: str = "XE"      
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"oracle+cx_oracle://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/?service_name={self.DB_SERVICE}"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # media settings
    MEDIA_ROOT: str = "media"
    RECIPE_IMAGES_DIR: str = "recipes"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()