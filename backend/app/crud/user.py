from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, follows
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    # update_data = user_in.dict(exclude_unset=True)
    update_data = user_in.model_dump(exclude_unset=True)

    
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["password_hash"] = hashed_password
        
    for field, value in update_data.items():
        setattr(db_user, field, value)
        
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def follow_user(db: Session, follower_id: int, following_id: int) -> bool:
    if follower_id == following_id:
        return False
    
    # Check if already following
    exists = db.query(follows).filter_by(
        follower_id=follower_id, 
        following_id=following_id
    ).first() is not None
    
    if exists:
        return False
        
    db.execute(
        follows.insert().values(
            follower_id=follower_id,
            following_id=following_id
        )
    )
    db.commit()
    return True

def unfollow_user(db: Session, follower_id: int, following_id: int) -> bool:
    result = db.execute(
        follows.delete().where(
            follows.c.follower_id == follower_id,
            follows.c.following_id == following_id
        )
    )
    db.commit()
    return result.rowcount > 0

def get_follow_stats(db: Session, user_id: int) -> Dict[str, int]:
    followers_count = db.query(func.count(follows.c.follower_id)).filter(
        follows.c.following_id == user_id
    ).scalar()
    
    following_count = db.query(func.count(follows.c.following_id)).filter(
        follows.c.follower_id == user_id
    ).scalar()
    
    return {
        "followers_count": followers_count,
        "following_count": following_count
    }