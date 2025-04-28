from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Dislike(Base):
    __tablename__ = "recipe_dislikes"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.recipe_id"), primary_key=True)
    disliked_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="dislikes")
    recipe = relationship("Recipe", back_populates="dislikes")