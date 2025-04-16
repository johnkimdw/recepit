from typing import Optional
from pydantic import BaseModel, EmailStr
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
    
    class Config:
        orm_mode = True

class User(UserInDBBase):
    pass

class UserWithFollow(User):
    followers_count: int
    following_count: int