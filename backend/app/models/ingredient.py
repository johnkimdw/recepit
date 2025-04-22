from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Sequence
from sqlalchemy.orm import relationship
from app.core.database import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    ingredient_id = Column(Integer, Sequence("INGREDIENT_ID_SEQ"), primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    calories = Column(Float, nullable=True)
    image_url = Column(String(255), nullable=True)
    
    # Relationships
    recipes = relationship("RecipeIngredient", back_populates="ingredient")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    recipe_id = Column(Integer, ForeignKey("recipes.recipe_id"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.ingredient_id"), primary_key=True)
    quantity = Column(String(255), nullable=True)
    
    # Relationships
    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipes")