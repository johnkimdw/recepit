from sqlalchemy import text
from app.core.database import engine, Base

# import all models to register them with Base.metadata
from app.models.user import User
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.category import Category, recipe_categories
from app.models.favorite import Favorite
from app.models.review import Review

def init_db():
    # Create all tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Verify tables were created
    with engine.connect() as conn:
        # Get a list of all tables in the schema
        result = conn.execute(text(
            "SELECT table_name FROM user_tables"
        ))
        tables = [row[0] for row in result]
        
        print("Created tables:")
        for table in tables:
            print(f"- {table}")
            
    print("Database initialization complete!")

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete!")

if __name__ == "__main__":
    init_db()