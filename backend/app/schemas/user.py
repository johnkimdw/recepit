from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass

class UserWithFollow(User):
    followers_count: int
    following_count: int
    save_count: int
    like_count: int
    posts: Optional[List["RecipeSmallCard"]] = None
    is_following: Optional[bool] = None
    
    # model_config = ConfigDict(from_attributes=True)

from app.schemas.recipe import RecipeSmallCard