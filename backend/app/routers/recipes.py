from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recipe import Recipe
from app.schemas.recipe import RecipeBase
from app.core.security import get_current_user 
from datetime import datetime, timezone
from app.models.user import User
from app.models.category import Category, recipe_categories

router = APIRouter()

@router.post("/")
def create_recipe(recipe: RecipeBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Debugging: print the received recipe data
    print("Received recipe data:", recipe)

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
    
    # Add the recipe to the recipes table
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    # Add to recipe_categories table
    if hasattr(recipe, "category_ids") and recipe.category_ids:
        for category_id in recipe.category_ids:
            category = db.query(Category).filter_by(category_id=category_id).first()
            print("Fetched category:", category)
            
            if category:
                db.execute(
                    recipe_categories.insert().values(recipe_id=new_recipe.recipe_id, category_id=category.category_id)
                )
            else:
                raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        db.commit()
        print(f"Categories associated with recipe {new_recipe.title}")

    return new_recipe