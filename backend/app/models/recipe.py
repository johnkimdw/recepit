from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    recipe_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=False)
    prep_time = Column(Integer, nullable=True)  # in minutes
    cook_time = Column(Integer, nullable=True)  # in minutes
    difficulty = Column(String(20), nullable=True)  # Easy, Medium, Hard
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="recipes")
    ingredients = relationship("RecipeIngredient", back_populates="recipe")
    categories = relationship("Category", secondary="recipe_categories", back_populates="recipes")
    favorites = relationship("Favorite", back_populates="recipe")
    reviews = relationship("Review", back_populates="recipe")