# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/")
# async def root():
#     return {"message": "Hello World"}

import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.security import get_current_user
from app.routers import auth, users
# Import all models to ensure proper initialization
import app.models
# , recipes, ingredients, categories, reviews, favorites

# Create media directory if it doesn't exist
os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
os.makedirs(os.path.join(settings.MEDIA_ROOT, settings.RECIPE_IMAGES_DIR), exist_ok=True)

app = FastAPI(
    title="Recipe Social API",
    description="API for a social recipe sharing application",
    version="1.0.0"
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["Content-Type", "Authorization", "Accept"],
        expose_headers=["Content-Type"],
        max_age=600,  # Cache preflight requests for 10 minutes
    )

# Mount static files for media
app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
# app.include_router(recipes.router, prefix=f"{settings.API_V1_STR}/recipes", tags=["Recipes"])
# app.include_router(ingredients.router, prefix=f"{settings.API_V1_STR}/ingredients", tags=["Ingredients"])
# app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["Categories"])
# app.include_router(reviews.router, prefix=f"{settings.API_V1_STR}/reviews", tags=["Reviews"])
# app.include_router(favorites.router, prefix=f"{settings.API_V1_STR}/favorites", tags=["Favorites"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Recipe Social API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}