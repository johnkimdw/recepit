from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, UserWithFollow
from app.schemas.recipe import Recipe
from app.crud.user import get_user, get_users, create_user, update_user, delete_user, follow_user, unfollow_user, get_follow_stats
# from app.crud.recipe import get_recipes

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get all users with pagination"""
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.get("/me", response_model=UserWithFollow)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user"""
    stats = get_follow_stats(db, current_user.user_id)
        
    # create a dictionary with user attributes and stats
    user_dict = {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at,
        "followers_count": stats["followers_count"],
        "following_count": stats["following_count"]
    }
    
    
    user_data = UserWithFollow.model_validate(user_dict)
    user_data.followers_count = stats["followers_count"]
    user_data.following_count = stats["following_count"]
    return user_data

@router.get("/{user_id}", response_model=UserWithFollow)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """Get a user by ID"""
    user = get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    stats = get_follow_stats(db, user_id)
    
    user_dict = {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "followers_count": stats["followers_count"],
        "following_count": stats["following_count"]
    }
    
    
    user_data = UserWithFollow.model_validate(user_dict)
    
    
    user_data.followers_count = stats["followers_count"]
    user_data.following_count = stats["following_count"]
    return user_data

# @router.get("/{user_id}/recipes", response_model=List[Recipe])
# def read_user_recipes(
#     user_id: int,
#     skip: int = 0, 
#     limit: int = 100, 
#     db: Session = Depends(get_db)
# ):
#     """Get all recipes by a user"""
#     recipes = get_recipes(db, skip=skip, limit=limit, user_id=user_id)
#     return recipes

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user"""
    user = update_user(db=db, db_user=current_user, user_in=user_in)
    return user

@router.post("/follow/{user_id}", status_code=status.HTTP_200_OK)
def follow_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Follow a user"""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
    target_user = get_user(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    success = follow_user(db, follower_id=current_user.user_id, following_id=user_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Already following this user")
        
    return {"message": "User followed successfully"}

@router.post("/unfollow/{user_id}", status_code=status.HTTP_200_OK)
def unfollow_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unfollow a user"""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot unfollow yourself")
        
    target_user = get_user(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    success = unfollow_user(db, follower_id=current_user.user_id, following_id=user_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Not following this user")
        
    return {"message": "User unfollowed successfully"}