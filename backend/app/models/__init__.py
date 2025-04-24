# Import all models to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.recipe import Recipe
from app.models.category import Category
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.favorite import Favorite
from app.models.review import Review
from app.models.save import Save

# This ensures all models are imported when the app starts
__all__ = ["User", "Recipe", "Category", "Ingredient", "RecipeIngredient", "Favorite", "Review", "Save"] 