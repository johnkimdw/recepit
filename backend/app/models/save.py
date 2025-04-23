from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Sequence
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Save(Base):
    __tablename__ = "saves"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.recipe_id"), primary_key=True)
    saved_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="saves")
    recipe = relationship("Recipe", back_populates="saves")