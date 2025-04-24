from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recipe import Recipe
from app.models.favorite import Favorite
from app.models.save import Save
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
from sqlalchemy import func, text, or_
import random
from typing import List

router = APIRouter()

@router.get("/likes", response_model=List[RecipeSmallCard])
def get_liked_recipes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # get all recipes that the user has liked, sorted from latest to earliest
    liked_recipes = db.query(Recipe).join(Favorite).filter(Favorite.user_id == user.user_id).order_by(Favorite.saved_at.desc()).all()

    for recipe in liked_recipes:
        total_ratings = len(recipe.reviews)
        average_rating = sum(review.rating for review in recipe.reviews) / len(recipe.reviews) if recipe.reviews else None
        recipe.average_rating = average_rating
        recipe.total_ratings = total_ratings

    return liked_recipes

def get_user_saved_recipes(user: User, db: Session, limit: int = None):
    query = db.query(Recipe).join(Save).filter(Save.user_id == user.user_id).order_by(Save.saved_at.desc())
    saved_recipes = query.limit(limit).all() if limit else query.all()

    for recipe in saved_recipes:
        total_ratings = len(recipe.reviews)
        average_rating = sum(review.rating for review in recipe.reviews) / total_ratings if total_ratings > 0 else None
        recipe.average_rating = average_rating
        recipe.total_ratings = total_ratings

    return saved_recipes

@router.get("/saves", response_model=List[RecipeSmallCard])
def get_saved_recipes(limit: int = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # get all recipes that the user has saved, sorted from latest to earliest
    return get_user_saved_recipes(user, db, limit=limit)

@router.get("/recent", response_model=List[RecipeSmallCard])
def get_recent_recipes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # get all recipes that the user has saved, sorted from latest to earliest
    result = get_user_saved_recipes(user, db, limit=20)
    for recipe in result:
        print(recipe.recipe_id)
    return result

@router.get("/search/likes", response_model=List[RecipeSmallCard])
def search_liked_recipes(query: str, limit: int = 8, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clean_q = query.strip().lower()
    if not clean_q:
        raise HTTPException(400, detail="Query must not be empty")

    # Oracle doesn't have ILIKE, so we force both sides to lower-case
    results = (
        db.query(Recipe)
        .join(Favorite)
        .filter(Favorite.user_id == user.user_id)
        .filter(
            or_(
                func.lower(Recipe.title).like(f"%{clean_q}%"),
            )
        )
        .order_by(Recipe.title)   # any ordering you like
        .limit(limit)
        .all()
    )

    if len(results) < 10:
        more_results = (
            db.query(Recipe)
            .join(Favorite)
            .filter(Favorite.user_id == user.user_id)
            .filter(
                or_(
                    func.lower(Recipe.description).like(f"%{clean_q}%"),
                )
            )
            .order_by(Recipe.title)   # any ordering you like
            .limit(limit - len(results))
            .all()
        )
        results.extend(more_results)

    return results

@router.get("/search/saves", response_model=List[RecipeSmallCard])
def search_saved_recipes(query: str, limit: int = 8, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clean_q = query.strip().lower()
    if not clean_q:
        raise HTTPException(400, detail="Query must not be empty")

    # Oracle doesn't have ILIKE, so we force both sides to lower-case
    results = (
        db.query(Recipe)
        .join(Save)
        .filter(Save.user_id == user.user_id)
        .filter(
            or_(
                func.lower(Recipe.title).like(f"%{clean_q}%"),
            )
        )
        .order_by(Recipe.title)   # any ordering you like
        .limit(limit)
        .all()
    )

    if len(results) < 10:
        more_results = (
            db.query(Recipe)
            .join(Save)
            .filter(Save.user_id == user.user_id)
            .filter(
                or_(
                    func.lower(Recipe.description).like(f"%{clean_q}%"),
                )
            )
            .order_by(Recipe.title)   # any ordering you like
            .limit(limit - len(results))
            .all()
        )
        results.extend(more_results)

    return results

@router.get("/search", response_model=List[RecipeSmallCard])
def search_recipes(query: str, limit: int = 8, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clean_q = query.strip().lower()
    if not clean_q:
        raise HTTPException(400, detail="Query must not be empty")
    
    results = search_liked_recipes(query, limit // 2, user, db)
    results.extend(search_saved_recipes(query, limit // 2, user, db))
    return results
