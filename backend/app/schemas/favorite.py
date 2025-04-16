from pydantic import BaseModel
from datetime import datetime

class FavoriteBase(BaseModel):
    recipe_id: int

class FavoriteCreate(FavoriteBase):
    pass

class Favorite(FavoriteBase):
    user_id: int
    saved_at: datetime
    
    class Config:
        orm_mode = True