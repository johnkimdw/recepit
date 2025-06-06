from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class IngredientBase(BaseModel):
    name: str
    calories: Optional[float] = None
    image_url: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    calories: Optional[float] = None
    image_url: Optional[str] = None

class IngredientInDBBase(IngredientBase):
    ingredient_id: int
    
    model_config = ConfigDict(from_attributes=True)

class RecipeIngredientBase(BaseModel):
    ingredient_id: int
    quantity: str 

class IngredientInRecipe(BaseModel):
    ingredient_id: int
    name: str
    quantity: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)