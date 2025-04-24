from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Sequence, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Association table for follows
follows = Table(
    "follows",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.user_id"), primary_key=True),
    Column("following_id", Integer, ForeignKey("users.user_id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    # user_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, Sequence("USER_ID_SEQ"), primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    recipes = relationship("Recipe", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    saves = relationship("Save", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    
    # Self-referential relationship for follows
    followers = relationship(
        "User", 
        secondary=follows,
        primaryjoin=user_id==follows.c.following_id,
        secondaryjoin=user_id==follows.c.follower_id,
        backref="following"
    )