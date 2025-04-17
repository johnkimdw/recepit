from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.schemas.ingredient import IngredientInRecipe
from app.schemas.category import Category

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: str
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    difficulty: Optional[str] = None

class RecipeCreate(RecipeBase):
    ingredients: List[IngredientInRecipe]
    category_ids: List[int] = []

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    difficulty: Optional[str] = None
    ingredients: Optional[List[IngredientInRecipe]] = None
    category_ids: Optional[List[int]] = None

class RecipeInDBBase(RecipeBase):
    recipe_id: int
    user_id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Recipe(RecipeInDBBase):
    pass

class RecipeDetail(Recipe):
    ingredients: List[IngredientInRecipe]
    categories: List[Category]
    average_rating: Optional[float] = None
    reviews_count: int
    favorites_count: int