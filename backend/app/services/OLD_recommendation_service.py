
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from sqlalchemy.sql import text
from typing import List, Dict, Any
import numpy as np
from datetime import datetime, timedelta
import random

from app.models.user import User
from app.models.recipe import Recipe
from app.models.favorite import Favorite
from app.models.save import Save
from app.models.dislike import Dislike
from app.models.user_similarity import UserSimilarity
from app.models.recommendation import RecipeRecommendation
from app.models.seen_recipe import SeenRecipe

def calculate_user_similarity(db: Session, user_id: int, top_n: int = 10):
    """Calculate similarity between a user and other users based on interactions."""
    # First, get all recipes the user has interacted with
    user_interactions = {}
    
    # Get favorites (weight 1.0)
    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    for fav in favorites:
        user_interactions[fav.recipe_id] = 1.0
    
    # Get saves (weight 0.5)
    saves = db.query(Save).filter(Save.user_id == user_id).all()
    for save in saves:
        user_interactions[save.recipe_id] = user_interactions.get(save.recipe_id, 0) + 0.5
    
    # Get dislikes (weight -0.1)
    dislikes = db.query(Dislike).filter(Dislike.user_id == user_id).all()
    for dislike in dislikes:
        user_interactions[dislike.recipe_id] = user_interactions.get(dislike.recipe_id, 0) - 0.1
    
    if not user_interactions:
        return
    
    # Find other users who have interacted with these recipes
    recipe_ids = list(user_interactions.keys())
    other_users = set()
    
    # Users who favorited these recipes
    fav_users = db.query(Favorite.user_id).filter(
        Favorite.recipe_id.in_(recipe_ids),
        Favorite.user_id != user_id
    ).distinct().all()
    other_users.update([u[0] for u in fav_users])
    
    # Users who saved these recipes
    save_users = db.query(Save.user_id).filter(
        Save.recipe_id.in_(recipe_ids),
        Save.user_id != user_id
    ).distinct().all()
    other_users.update([u[0] for u in save_users])
    
    # Users who disliked these recipes
    dislike_users = db.query(Dislike.user_id).filter(
        Dislike.recipe_id.in_(recipe_ids),
        Dislike.user_id != user_id
    ).distinct().all()
    other_users.update([u[0] for u in dislike_users])
    
    similarities = []
    
    for other_id in other_users:
        other_interactions = {}
        
        # Get other user's favorites
        other_favs = db.query(Favorite).filter(Favorite.user_id == other_id).all()
        for fav in other_favs:
            other_interactions[fav.recipe_id] = 1.0
        
        # Get other user's saves
        other_saves = db.query(Save).filter(Save.user_id == other_id).all()
        for save in other_saves:
            other_interactions[save.recipe_id] = other_interactions.get(save.recipe_id, 0) + 0.5
        
        # Get other user's dislikes
        other_dislikes = db.query(Dislike).filter(Dislike.user_id == other_id).all()
        for dislike in other_dislikes:
            other_interactions[dislike.recipe_id] = other_interactions.get(dislike.recipe_id, 0) - 0.1
        
        # Calculate cosine similarity
        common_recipes = set(user_interactions.keys()) & set(other_interactions.keys())
        if not common_recipes:
            continue
            
        dot_product = sum(user_interactions[r] * other_interactions[r] for r in common_recipes)
        
        user_magnitude = np.sqrt(sum(val**2 for val in user_interactions.values()))
        other_magnitude = np.sqrt(sum(val**2 for val in other_interactions.values()))
        
        if user_magnitude > 0 and other_magnitude > 0:
            similarity = dot_product / (user_magnitude * other_magnitude)
            similarities.append((other_id, similarity))
    
    # Sort by similarity and take top N
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_similarities = similarities[:top_n]
    
    # Store in database
    for other_id, similarity_score in top_similarities:
        # Check if exists
        existing = db.query(UserSimilarity).filter(
            UserSimilarity.user_id_1 == user_id,
            UserSimilarity.user_id_2 == other_id
        ).first()
        
        if existing:
            existing.similarity_score = similarity_score
            existing.last_updated = datetime.now()
        else:
            db.add(UserSimilarity(
                user_id_1=user_id,
                user_id_2=other_id,
                similarity_score=similarity_score
            ))
    
    db.commit()

def generate_recommendations(db: Session, user_id: int, count: int = 20):
    print("generating...")
    """Generate recipe recommendations for a user."""
    # Get similar users
    similar_users = db.query(UserSimilarity).filter(
        UserSimilarity.user_id_1 == user_id
    ).order_by(UserSimilarity.similarity_score.desc()).all()
    
    if not similar_users:
        # No similar users, calculate similarities first
        calculate_user_similarity(db, user_id)
        
        # Try again
        similar_users = db.query(UserSimilarity).filter(
            UserSimilarity.user_id_1 == user_id
        ).order_by(UserSimilarity.similarity_score.desc()).all()
        print(similar_users)
        # If still no similar users, return popular recipes
        if not similar_users:
            return generate_popular_recommendations(db, user_id, count)
    
    # Get recipes the user has already seen
    seen_recipe_ids = get_seen_recipe_ids(db, user_id)
    
    # Get recommendations from similar users
    recommendations = []
    
    for similar_user in similar_users:
        other_id = similar_user.user_id_2
        similarity_score = similar_user.similarity_score
        
        # Get favorites of similar user
        favs = db.query(Favorite).filter(Favorite.user_id == other_id).all()
        for fav in favs:
            if fav.recipe_id not in seen_recipe_ids:
                recommendations.append({
                    'recipe_id': fav.recipe_id,
                    'score': 1.0 * similarity_score
                })
                seen_recipe_ids.add(fav.recipe_id)
                
        # Get saves of similar user (with lower weight)
        saves = db.query(Save).filter(Save.user_id == other_id).all()
        for save in saves:
            if save.recipe_id not in seen_recipe_ids:
                recommendations.append({
                    'recipe_id': save.recipe_id,
                    'score': 0.5 * similarity_score
                })
                seen_recipe_ids.add(save.recipe_id)
    
    # Sort by score and take top 'count'
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    top_recommendations = recommendations[:count]
    
    # If we don't have enough recommendations, add some popular ones
    if len(top_recommendations) < count:
        additional_count = count - len(top_recommendations)
        popular_recs = generate_popular_recommendations(db, user_id, additional_count)
        top_recommendations.extend(popular_recs)
    
    # Store recommendations in database
    for rec in top_recommendations:
        # Check if already exists
        existing = db.query(RecipeRecommendation).filter(
            RecipeRecommendation.user_id == user_id,
            RecipeRecommendation.recipe_id == rec['recipe_id']
        ).first()
        
        if not existing:
            db.add(RecipeRecommendation(
                user_id=user_id,
                recipe_id=rec['recipe_id'],
                recommendation_score=rec['score'],
                status='pending'
            ))
    # print(f"recs: {recommendations}")
    # print(f"top: {top_recommendations}")
    
    db.commit()
    
    return top_recommendations

def generate_popular_recommendations(db: Session, user_id: int, count: int = 10):
    """Generate recommendations based on recipe popularity."""
    # Get recipes the user has already seen
    seen_recipe_ids = get_seen_recipe_ids(db, user_id)
    
    # Get popular recipes (most favorited)
    popular_recipes = db.query(
        Recipe.recipe_id,
        func.count(Favorite.user_id).label('favorite_count')
    ).join(Favorite).group_by(Recipe.recipe_id).order_by(
        desc('favorite_count')
    ).limit(count * 2).all()  # Get more than needed to allow for filtering
    
    # Filter out seen recipes
    recommendations = []
    for recipe_id, fav_count in popular_recipes:
        if recipe_id not in seen_recipe_ids and len(recommendations) < count:
            recommendations.append({
                'recipe_id': recipe_id,
                'score': fav_count / 10.0  # Normalize the score
            })
            seen_recipe_ids.add(recipe_id)
    
    # If we still need more, get some random recipes
    if len(recommendations) < count:
        additional_needed = count - len(recommendations)
        
        # Query for random recipes the user hasn't seen
        # random_recipes = db.query(Recipe.recipe_id).filter(
        #     ~Recipe.recipe_id.in_(seen_recipe_ids)
        # ).order_by(func.random()).limit(additional_needed).all()
        
        random_recipes = db.query(Recipe.recipe_id).filter(
            ~Recipe.recipe_id.in_(seen_recipe_ids)
        ).order_by(text("DBMS_RANDOM.VALUE")).limit(20).all()
        for (recipe_id,) in random_recipes:
            recommendations.append({
                'recipe_id': recipe_id,
                'score': 0.1  # Low score for random recommendations
            })
    
    return recommendations

def get_seen_recipe_ids(db: Session, user_id: int):
    """Get set of recipe IDs the user has already seen."""
    seen_ids = set()
    
    # Recipes the user has favorited
    favs = db.query(Favorite.recipe_id).filter(Favorite.user_id == user_id).all()
    seen_ids.update([f[0] for f in favs])
    
    # Recipes the user has saved
    saves = db.query(Save.recipe_id).filter(Save.user_id == user_id).all()
    seen_ids.update([s[0] for s in saves])
    
    # Recipes the user has disliked
    dislikes = db.query(Dislike.recipe_id).filter(Dislike.user_id == user_id).all()
    seen_ids.update([d[0] for d in dislikes])
    
    # Recipes the user has been shown
    seen = db.query(SeenRecipe.recipe_id).filter(SeenRecipe.user_id == user_id).all()
    seen_ids.update([s[0] for s in seen])
    
    # Recommendations that have been shown or interacted with
    recommendations = db.query(RecipeRecommendation.recipe_id).filter(
        RecipeRecommendation.user_id == user_id,
        RecipeRecommendation.status.in_(['shown', 'interacted'])
    ).all()
    seen_ids.update([r[0] for r in recommendations])
    
    return seen_ids

def get_next_recommendations(db: Session, user_id: int, limit: int = 5):
    """Get next batch of recipe recommendations for a user."""
    # Get pending recommendations
    recommendations = db.query(RecipeRecommendation).filter(
        RecipeRecommendation.user_id == user_id,
        RecipeRecommendation.status == 'pending'
    ).order_by(RecipeRecommendation.recommendation_score.desc()).limit(limit).all()
    
    # Mark these as shown
    for rec in recommendations:
        rec.status = 'shown'
        
        # Also add to seen_recipes
        existing_seen = db.query(SeenRecipe).filter(
            SeenRecipe.user_id == user_id,
            SeenRecipe.recipe_id == rec.recipe_id
        ).first()
        
        if not existing_seen:
            db.add(SeenRecipe(
                user_id=user_id,
                recipe_id=rec.recipe_id
            ))
    
    db.commit()
    
    # Count remaining recommendations
    remaining_count = db.query(func.count(RecipeRecommendation.recommendation_id)).filter(
        RecipeRecommendation.user_id == user_id,
        RecipeRecommendation.status == 'pending'
    ).scalar()
    
    # If below threshold, generate more recommendations in the background
    threshold = 5
    if remaining_count < threshold:
        # Note: In a real implementation, this would be a background task
        # For simplicity, we're doing it synchronously here
        generate_recommendations(db, user_id)
    
    # Get the actual recipe objects
    recipe_ids = [rec.recipe_id for rec in recommendations]
    if recipe_ids:
        recipes = db.query(Recipe).filter(Recipe.recipe_id.in_(recipe_ids)).all()
        
        # Add average ratings
        for recipe in recipes:
            total_ratings = db.query(func.count()).filter(
                Recipe.recipe_id == recipe.recipe_id
            ).scalar()
            
            if total_ratings > 0:
                avg_rating = db.query(func.avg(Recipe.rating)).filter(
                    Recipe.recipe_id == recipe.recipe_id
                ).scalar()
                recipe.average_rating = avg_rating
            else:
                recipe.average_rating = None
            
            recipe.total_ratings = total_ratings
        
        return recipes
    
    return []

def record_interaction(db: Session, user_id: int, recipe_id: int, interaction_type: str):
    """Record a user's interaction with a recipe."""
    # Update recommendation status if exists
    recommendation = db.query(RecipeRecommendation).filter(
        RecipeRecommendation.user_id == user_id,
        RecipeRecommendation.recipe_id == recipe_id,
        RecipeRecommendation.status == 'shown'
    ).first()
    
    if recommendation:
        recommendation.status = 'interacted'
    
    # Record the interaction
    if interaction_type == 'like':
        # Check if already exists
        existing = db.query(Favorite).filter(
            Favorite.user_id == user_id,
            Favorite.recipe_id == recipe_id
        ).first()
        
        if not existing:
            db.add(Favorite(
                user_id=user_id,
                recipe_id=recipe_id
            ))
    
    elif interaction_type == 'save':
        # Check if already exists
        existing = db.query(Save).filter(
            Save.user_id == user_id,
            Save.recipe_id == recipe_id
        ).first()
        
        if not existing:
            db.add(Save(
                user_id=user_id,
                recipe_id=recipe_id
            ))
    
    elif interaction_type == 'dislike':
        # Check if already exists
        existing = db.query(Dislike).filter(
            Dislike.user_id == user_id,
            Dislike.recipe_id == recipe_id
        ).first()
        
        if not existing:
            db.add(Dislike(
                user_id=user_id,
                recipe_id=recipe_id
            ))
    
    db.commit()