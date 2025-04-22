from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

class CategoryInDBBase(CategoryBase):
    category_id: int
    
    model_config = ConfigDict(from_attributes=True)