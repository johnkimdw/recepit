from sqlalchemy import text
from app.core.database import engine, Base
from app.models.user import User
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.category import Category
from app.models.favorite import Favorite
from app.models.review import Review

def init_db():
    # Import all models so they're registered with Base.metadata
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # You could add initial data here if needed
    # For example, create default categories
    
    print("Database tables created successfully")

if __name__ == "__main__":
    init_db()