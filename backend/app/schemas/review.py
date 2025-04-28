from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ReviewBase(BaseModel):
    recipe_id: Optional[int] = None
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1, le=5)
    comment: Optional[str] = None

class ReviewInDBBase(ReviewBase):
    review_id: int
    user_id: int
    user_name: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)