from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.recipe import Recipe
from app.schemas.recipe import RecipeSmallCard
from app.schemas.recommendation import InteractionCreate, RecommendationResponse
from app.services.recommendation_service import (
    calculate_user_similarity,
    generate_recommendations,
    get_next_recommendations,
    record_interaction
)

router = APIRouter()

@router.get("/", response_model=List[RecipeSmallCard])
def get_recommendations(
    limit: int = 10,
    user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get personalized recipe recommendations for the user to swipe on."""
    try:
        recipes = get_next_recommendations(db, user.user_id, limit)
        print(f"got these recipes in GET_RECOMMENDATIONS via get_next route:\n {len(recipes)}")
        return recipes
    except Exception as e:
        # Log the error but return an empty list instead of crashing
        print(f"Error in recommendation endpoint: {e}")
        return []

# @router.get("/", response_model=List[RecipeSmallCard])
# def get_recommendations(
#     limit: int = 5,
#     user: User = Depends(get_current_user), 
#     db: Session = Depends(get_db)
# ):
#     """Get personalized recipe recommendations for the user to swipe on."""
#     recipes = get_next_recommendations(db, user.user_id, limit)
#     print(f"got these recipes in GET_RECOMMENDATIONS via get_next route:\n {len(recipes)}")
    
#     if not recipes:
#         # Generate recommendations if none exist
#         generate_recommendations(db, user.user_id)
#         recipes = get_next_recommendations(db, user.user_id, limit)
#     print(f"got these recipes in GET_RECOMMENDATIONS via gen_recs + get_next route:\n {len(recipes)}")
    
#     return recipes

@router.post("/interactions")
def create_interaction(
    interaction: InteractionCreate,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a user's interaction with a recipe (like, save, dislike)."""
    if interaction.interaction_type not in ['like', 'save', 'dislike']:
        raise HTTPException(status_code=400, detail="Invalid interaction type")
    
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.recipe_id == interaction.recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Record the interaction
    record_interaction(db, user.user_id, interaction.recipe_id, interaction.interaction_type)
    
    # Schedule similarity recalculation in the background
    # background_tasks.add_task(calculate_user_similarity, db, user.user_id)
    
    return {"status": "success"}

@router.post("/refresh")
def refresh_recommendations(
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Force refresh recommendations for the user."""
    print("IN REFRESH: ADDED GENERATE_RECOMMENDATIONS TO BACKGROUND TASKS")
    background_tasks.add_task(generate_recommendations, db, user.user_id)
    return {"status": "Refreshing recommendations"}






# from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
# from sqlalchemy.orm import Session
# from typing import List

# from app.core.database import get_db
# from app.core.security import get_current_user
# from app.models.user import User
# from app.models.recipe import Recipe
# from app.schemas.recipe import RecipeSmallCard
# from app.schemas.recommendation import InteractionCreate, RecommendationResponse
# from app.models.dislike import Dislike
# from app.models.recommendation import RecipeRecommendation
# from app.services.recommendation_service import (
#     calculate_user_similarity,
#     generate_recommendations,
#     get_next_recommendations,
#     record_interaction
# )

# router = APIRouter()

# @router.get("/", response_model=List[RecipeSmallCard])
# def get_recommendations(
#     limit: int = 5,
#     user: User = Depends(get_current_user), 
#     db: Session = Depends(get_db)
# ):
#     """Get personalized recipe recommendations for the user to swipe on."""
#     recipes = get_next_recommendations(db, user.user_id, limit)
    
#     if not recipes:
#         # Generate recommendations if none exist
#         generate_recommendations(db, user.user_id)
#         recipes = get_next_recommendations(db, user.user_id, limit)
    
#     return recipes

# @router.post("/interactions")
# def create_interaction(
#     interaction: InteractionCreate,
#     background_tasks: BackgroundTasks,
#     user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     """Record a user's interaction with a recipe (like, save, dislike)."""
#     if interaction.interaction_type not in ['like', 'save', 'dislike']:
#         raise HTTPException(status_code=400, detail="Invalid interaction type")
    
#     # Check if recipe exists
#     recipe = db.query(Recipe).filter(Recipe.recipe_id == interaction.recipe_id).first()
#     if not recipe:
#         raise HTTPException(status_code=404, detail="Recipe not found")
    
#     # Record the interaction
#     record_interaction(db, user.user_id, interaction.recipe_id, interaction.interaction_type)
    
#     # Schedule similarity recalculation in the background
#     background_tasks.add_task(calculate_user_similarity, db, user.user_id)
    
#     return {"status": "success"}

# @router.post("/refresh")
# def refresh_recommendations(
#     background_tasks: BackgroundTasks,
#     user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     """Force refresh recommendations for the user."""
#     background_tasks.add_task(generate_recommendations, db, user.user_id)
#     return {"status": "Refreshing recommendations"}
