from sqlalchemy import Column, Integer, String, ForeignKey, Table, Sequence
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association table for recipe categories
recipe_categories = Table(
    "recipe_categories",
    Base.metadata,
    Column("recipe_id", Integer, ForeignKey("recipes.recipe_id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.category_id"), primary_key=True),
)

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, Sequence("CATEGORY_ID_SEQ"), primary_key=True)
    name = Column(String(50), nullable=False, unique=True)
    
    # Relationships
    recipes = relationship("Recipe", secondary=recipe_categories, back_populates="categories")