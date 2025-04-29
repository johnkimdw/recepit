from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, follows
from app.models.recipe import Recipe as RecipeModel
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, UserWithFollow
from app.schemas.recipe import Recipe, RecipeSmallCard
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
        "following_count": stats["following_count"],
        "save_count": stats["save_count"],
        "like_count": stats["like_count"]
    }
    
    
    user_data = UserWithFollow.model_validate(user_dict)
    user_data.followers_count = stats["followers_count"]
    user_data.following_count = stats["following_count"]
    user_data.save_count = stats["save_count"]
    user_data.like_count = stats["like_count"]
    return user_data

def helper_get_user_posts(limit: int, db: Session, user_id: int):
    if limit == 0:
        posts = db.query(RecipeModel).filter(RecipeModel.user_id == user_id).order_by(RecipeModel.created_at.desc()).all()
    else:
        posts = db.query(RecipeModel).filter(RecipeModel.user_id == user_id).order_by(RecipeModel.created_at.desc()).limit(limit).all()
    return posts

@router.get("/posts/{user_id}", response_model=List[RecipeSmallCard])
def read_user_posts(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user posts"""
    posts = helper_get_user_posts(0, db, user_id)
    return posts

@router.get("/{user_id}", response_model=UserWithFollow)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a user by ID"""
    user = get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    stats = get_follow_stats(db, user_id)

    posts = helper_get_user_posts(10, db, user_id)

    if (current_user.user_id != user_id):
        is_following = db.query(follows).filter(follows.c.follower_id == current_user.user_id, follows.c.following_id == user_id).first() is not None
    else:
        is_following = None
    
    user_dict = {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "followers_count": stats["followers_count"],
        "following_count": stats["following_count"],
        "save_count": stats["save_count"],
        "like_count": stats["like_count"],
        "posts": posts,
        "is_following": is_following
    }
    
    
    user_data = UserWithFollow.model_validate(user_dict)
    
    
    user_data.followers_count = stats["followers_count"]
    user_data.following_count = stats["following_count"]
    user_data.save_count = stats["save_count"]
    user_data.like_count = stats["like_count"]
    user_data.posts = posts
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

@router.get("/followers/{user_id}", response_model=List[UserSchema])
def read_user_followers(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all users who follow the specified user"""
    # Query all users who follow this user (users where this user is being followed)
    followers = db.query(User).join(
        follows, 
        follows.c.follower_id == User.user_id
    ).filter(
        follows.c.following_id == user_id
    ).all()
    
    return followers

@router.get("/following/{user_id}", response_model=List[UserSchema])
def read_user_following(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all users that the specified user follows"""
    # Query all users that this user follows (users that are being followed by this user)
    following = db.query(User).join(
        follows, 
        follows.c.following_id == User.user_id
    ).filter(
        follows.c.follower_id == user_id
    ).all()
    
    return following