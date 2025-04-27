from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recipe import Recipe
from app.schemas.recipe import RecipeBase, RecipeDetail, RecipeInDBBase, SimpleRecipe, RecipeSmallCard
from app.schemas.ingredient import IngredientInRecipe
from app.schemas.category import CategoryInDBBase
from app.schemas.review import ReviewInDBBase
from app.schemas.user import UserInDBBase
from app.core.security import get_current_user 
from datetime import datetime, timezone
from app.models.user import User
from app.models.category import Category, recipe_categories
from app.models.ingredient import RecipeIngredient, Ingredient
from app.models.review import Review
from app.models.save import Save
from sqlalchemy import func, text, or_
import random
from typing import List
from app.core.aws import generate_presigned_url  
import os 
from fastapi import File

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

@router.get("/generate-presigned-url")
def get_presigned_url():
    return generate_presigned_url()


@router.get("/featured", response_model=SimpleRecipe)
def get_featured_recipes(db: Session = Depends(get_db)):
    # get one featured recipe that has average rating over 4.5
    subquery = (
        db.query(Recipe.recipe_id)
        .join(Review)
        .group_by(Recipe.recipe_id)
        .having(func.avg(Review.rating) >= 4.5)
        .order_by(text("DBMS_RANDOM.VALUE"))
        .limit(1)
        .subquery()
    )

    featured_recipe = db.query(Recipe).join(subquery, Recipe.recipe_id == subquery.c.recipe_id).first()

    return featured_recipe

@router.get("/category/{category}", response_model=List[RecipeSmallCard])
def get_recipes_by_category(category: str, db: Session = Depends(get_db)):
    # find the category id first, case insensitive
    category = db.query(Category).filter(func.lower(Category.name) == category.strip().lower()).first()

    # find recipes that has the category id in its recipe.category
    recipes = db.query(Recipe).join(Recipe.categories).filter(Category.category_id == category.category_id).all()

    # ramdomly pick 10 results
    recipes = random.sample(recipes, 10)

    for recipe in recipes:
        total_ratings = len(recipe.reviews)
        average_rating = sum(review.rating for review in recipe.reviews) / len(recipe.reviews) if recipe.reviews else None
        recipe.average_rating = average_rating
        recipe.total_ratings = total_ratings

    return recipes

@router.get("/details/{recipe_id}", response_model=RecipeDetail)
def get_recipe_details(recipe_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

        is_saved=False
    )

    for save in user.saves:
        if save.recipe_id == recipe_id:
            recipe_details.is_saved = True
            break

    return recipe_details

@router.get("/search", response_model=List[SimpleRecipe])
def search_recipes(query: str, db: Session = Depends(get_db)):
    clean_q = query.strip().lower()
    if not clean_q:
        raise HTTPException(400, detail="Query must not be empty")

    # Oracle doesn't have ILIKE, so we force both sides to lower-case
    results = (
        db.query(Recipe)
        .filter(
            or_(
                func.lower(Recipe.title).like(f"%{clean_q}%"),
            )
        )
        .order_by(Recipe.title)   # any ordering you like
        .limit(8)
        .all()
    )

    if len(results) < 10:
        more_results = (
            db.query(Recipe)
            .filter(
                or_(
                    func.lower(Recipe.description).like(f"%{clean_q}%"),
                )
            )
            .order_by(Recipe.title)   # any ordering you like
            .limit(8 - len(results))
            .all()
        )
        results.extend(more_results)

    return results

@router.patch("/save/{recipe_id}")
def save_recipe(recipe_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.recipe_id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    save = Save(
        user_id=user.user_id,
        recipe_id=recipe_id,
        saved_at=datetime.now(timezone.utc),
    )
    db.add(save)
    db.commit()

    return {"message": "Recipe saved"}

@router.patch("/unsave/{recipe_id}")
def unsave_recipe(recipe_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.recipe_id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    save = db.query(Save).filter(Save.user_id == user.user_id, Save.recipe_id == recipe_id).first()
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    
    db.delete(save)
    db.commit()
    return {"message": "Recipe unsaved"}