from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Sequence, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class RecipeRecommendation(Base):
    __tablename__ = "recipe_recommendations"

    recommendation_id = Column(Integer, Sequence("recommendation_id_seq"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.recipe_id"), nullable=False)
    recommendation_score = Column(Float, default=0.0)
    status = Column(String(20), default='pending')  # 'pending', 'shown', 'interacted'
    generated_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="recommendations")
    recipe = relationship("Recipe", back_populates="recommendations")
    
    # Indexes for faster lookups
    __table_args__ = (
        Index('idx_rec_user_recipe', user_id, recipe_id, unique=True),
        Index('idx_rec_user_status', user_id, status),
    )