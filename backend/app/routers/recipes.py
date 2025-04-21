from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recipe import Recipe
from app.schemas.recipe import RecipeBase
from app.models.user import User
from app.core.security import get_current_user 
from datetime import datetime, timezone
from app.models.user import User

router = APIRouter()
@router.post("/")
def create_recipe(recipe: RecipeBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_recipe = Recipe(
        title=recipe.title,
        description=recipe.description or "",
        instructions=recipe.instructions,
        prep_time=recipe.prep_time or 0,
        cook_time=recipe.cook_time or 0,
        difficulty=recipe.difficulty or "Unknown", 
        user_id=user.user_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        image_url=recipe.image_url or "",
    )
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)
    return new_recipe