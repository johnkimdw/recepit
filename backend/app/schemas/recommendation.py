from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.recipe import RecipeSmallCard

class InteractionCreate(BaseModel):
    recipe_id: int
    interaction_type: str  # 'like', 'save', 'dislike'

class RecommendationBase(BaseModel):
    recipe_id: int
    recommendation_score: float
    
class RecommendationCreate(RecommendationBase):
    user_id: int
    status: str = 'pending'

class Recommendation(RecommendationBase):
    recommendation_id: int
    user_id: int
    status: str
    generated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RecommendationResponse(BaseModel):
    recommendations: List[RecipeSmallCard]
    
    model_config = ConfigDict(from_attributes=True)