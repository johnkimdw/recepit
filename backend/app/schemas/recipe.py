from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.ingredient import RecipeIngredientBase  

from app.schemas.ingredient import IngredientInRecipe
from app.schemas.category import CategoryInDBBase
from app.schemas.review import ReviewInDBBase
from app.schemas.user import UserInDBBase

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: str
    ingredients: List[dict]  
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    difficulty: Optional[str] = None
    image_url: Optional[str] = None
    category_ids: Optional[List[int]] 

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    difficulty: Optional[str] = None
    ingredients: Optional[List[IngredientInRecipe]] = None
    category_ids: Optional[List[int]] = None
    ingredients: Optional[List[RecipeIngredientBase]]  

class RecipeInDBBase(RecipeBase):
    recipe_id: int
    user_id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SimpleRecipe(BaseModel):
    recipe_id: int
    title: str
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RecipeSmallCard(BaseModel):
    recipe_id: int
    title: str
    image_url: Optional[str] = None
    average_rating: Optional[float] = None
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    total_ratings: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class Recipe(RecipeInDBBase):
    pass

class RecipeDetail(Recipe):
    user: UserInDBBase
    ingredients: List[IngredientInRecipe]
    categories: List[CategoryInDBBase]
    reviews: List[ReviewInDBBase]
    average_rating: Optional[float] = None
    reviews_count: Optional[int] = None
    favorites_count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)