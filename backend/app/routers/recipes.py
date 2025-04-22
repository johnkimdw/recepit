from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recipe import Recipe
from app.schemas.recipe import RecipeBase, RecipeDetail
from app.schemas.ingredient import IngredientInRecipe
from app.schemas.category import CategoryInDBBase
from app.schemas.review import ReviewInDBBase
from app.schemas.user import UserInDBBase
from app.core.security import get_current_user 
from datetime import datetime, timezone
from app.models.user import User
from app.models.category import Category, recipe_categories
from app.models.ingredient import RecipeIngredient, Ingredient

router = APIRouter()

@router.post("/")
def create_recipe(recipe: RecipeBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
            
            if category:
                db.execute(
                    recipe_categories.insert().values(recipe_id=new_recipe.recipe_id, category_id=category.category_id)
                )
            else:
                raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        db.commit()

    # Insert recipe_ingredients
    if hasattr(recipe, "ingredients") and recipe.ingredients:
        for ingredient_data in recipe.ingredients:
            ingredient = db.query(Ingredient).filter(Ingredient.name == ingredient_data['name']).first()
            if not ingredient:
                ingredient = Ingredient(
                    name=ingredient_data['name'],
                )
                db.add(ingredient)
                db.flush()

            recipe_ingredient = RecipeIngredient(
                recipe_id=new_recipe.recipe_id,
                ingredient_id=ingredient.ingredient_id,
                quantity=ingredient_data["quantity"], 
            )
            db.add(recipe_ingredient)

        db.commit()


    return new_recipe

@router.get("/details/{recipe_id}", response_model=RecipeDetail)
def get_recipe_details(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.recipe_id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    review_count = len(recipe.reviews)
    favorite_count = len(recipe.favorites)
    average_rating = sum(review.rating for review in recipe.reviews) / review_count if review_count > 0 else None

    recipe_details = RecipeDetail(
        recipe_id=recipe.recipe_id,
        user_id=recipe.user_id,
        title=recipe.title,
        description=recipe.description,
        instructions=recipe.instructions,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        difficulty=recipe.difficulty,
        image_url=recipe.image_url,
        created_at=recipe.created_at,
        updated_at=recipe.updated_at,
        category_ids = [c.category_id for c in recipe.categories],
        # convert the ORM into pydantic
        user = UserInDBBase.model_validate(recipe.user),
        ingredients=[IngredientInRecipe(ingredient_id=i.ingredient.ingredient_id ,name=i.ingredient.name, quantity=i.quantity) for i in recipe.ingredients],
        categories=[CategoryInDBBase.model_validate(c) for c in recipe.categories], # convert the ORM into pydantic
        reviews=[ReviewInDBBase.model_validate(r) for r in recipe.reviews],
        average_rating=average_rating,
        reviews_count=review_count,
        favorites_count=favorite_count,
    )

    return recipe_details
