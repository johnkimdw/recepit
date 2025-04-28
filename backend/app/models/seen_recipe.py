from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class SeenRecipe(Base):
    __tablename__ = "seen_recipes"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.recipe_id"), primary_key=True)
    seen_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="seen_recipes")
    recipe = relationship("Recipe", back_populates="seen_by")