# app/services/recommendation_service.py
from sqlalchemy.orm import Session
from sqlalchemy import text, bindparam
import cx_Oracle
from typing import List, Dict, Any

from app.models.recipe import Recipe
from app.models.review import Review
from app.models.user import User
from app.models.recommendation import RecipeRecommendation
from app.models.dislike import Dislike

def calculate_user_similarity(db: Session, user_id: int, top_n: int = 10):
    """Call the database procedure to calculate user similarity."""
    try:
        # Execute the stored procedure, catching and handling any errors
        db.execute(
            text("BEGIN find_similar_users(:user_id, :top_n); END;"),
            {"user_id": user_id, "top_n": top_n}
        )
        db.commit()
        return True
    # handle:
        # ORA-00001: unique constraint (TEST_USER1.USER_SIM_UNIQUE) violated
        # ORA-06512: at "TEST_USER1.FIND_SIMILAR_USERS", line 37
    except Exception as e:
        db.rollback()
        print(f"Error calculating user similarity: {e}")
        
        # If it's a unique constraint violation, try again with a manual delete
        if "ORA-00001" in str(e) and "USER_SIM_UNIQUE" in str(e):
            try:
                # Try with both user_id_1 and user_id_2
                db.execute(
                    text("DELETE FROM user_similarity WHERE user_id_1 = :user_id OR user_id_2 = :user_id"),
                    {"user_id": user_id}
                )
                db.commit()
                
                # Try the stored procedure again
                db.execute(
                    text("BEGIN find_similar_users(:user_id, :top_n); END;"),
                    {"user_id": user_id, "top_n": 10}
                )
                db.commit()
                return True
            except Exception as inner_e:
                db.rollback()
                print(f"Error in second attempt at calculating user similarity: {inner_e}")
                return False
        return False
    
def generate_simple_recommendations(db, user_id, limit=10):
    """Simple recommendation system"""
    try:
        # exclude disliked + already recommended recipes
        # exclude user's disliked recipes 
        disliked_recipes = db.query(Dislike.recipe_id).filter(Dislike.user_id == user_id).all()
        disliked_recipe_ids = [r.recipe_id for r in disliked_recipes] if disliked_recipes else []
        
        # recommended recipes
        existing_recommendations = db.query(RecipeRecommendation.recipe_id).filter(
            RecipeRecommendation.user_id == user_id
        ).all()
        existing_rec_ids = [r.recipe_id for r in existing_recommendations] if existing_recommendations else []
        
        # combine IDs to exclude
        # exclude_ids = list(set(disliked_recipe_ids + existing_rec_ids))
        exclude_ids = tuple(set(disliked_recipe_ids + existing_rec_ids))

        
        # query for recipes, using DBMS_RANDOM.VALUE for Oracle
        query = text("""
        SELECT r.recipe_id 
        FROM recipes r
        WHERE (:exclude_empty = 1 OR r.recipe_id NOT IN :exclude_ids)
        ORDER BY DBMS_RANDOM.VALUE
        FETCH FIRST :limit ROWS ONLY
    """).bindparams(bindparam('exclude_ids', expanding=True))

        # Execute with parameters
 
        
        exclude_empty = 1 if not exclude_ids else 0
        result = db.execute(
            query, 
            {
                "exclude_ids": tuple(exclude_ids) if exclude_ids else (-1,),  # Dummy value if empty
                "exclude_empty": exclude_empty,
                "limit": limit
            }
        )
        
        recipe_ids = [row[0] for row in result]
        
        # create recommendation entries
        for recipe_id in recipe_ids:
            recommendation = RecipeRecommendation(
                user_id=user_id,
                recipe_id=recipe_id,
                recommendation_score=0.5,  # default score
                status='pending'
            )
            db.add(recommendation)
        
        db.commit()
        
        # Get the actual recipes
        recipes = db.query(Recipe).filter(Recipe.recipe_id.in_(recipe_ids)).all()
        
        # Update recommendations to 'shown'
        db.query(RecipeRecommendation).filter(
            RecipeRecommendation.user_id == user_id,
            RecipeRecommendation.recipe_id.in_(recipe_ids),
            RecipeRecommendation.status == 'pending'
        ).update({"status": "shown"}, synchronize_session=False)
        
        db.commit()
        return recipes
    except Exception as e:
        db.rollback()
        print(f"Error in generate_simple_recommendations: {e}")
        return []


def generate_recommendations(db: Session, user_id: int, count: int = 20):
    """Call the database procedure to generate recommendations."""
    db.execute(
        text("BEGIN generate_recommendations(:user_id, :count); END;"),
        {"user_id": user_id, "count": count}
    )
    db.commit()

# new simpler version 
# def get_next_recommendations(db, user_id, limit):
#     """Get the next batch of recommendations for a user."""
#     try:
#         # First check for existing pending recommendations
#         pending_recommendations = db.query(RecipeRecommendation).filter(
#             RecipeRecommendation.user_id == user_id,
#             RecipeRecommendation.status == 'pending'
#         ).order_by(RecipeRecommendation.recommendation_score.desc()).limit(limit).all()
        
#         if pending_recommendations:
#             # Get recipe IDs
#             recipe_ids = [rec.recipe_id for rec in pending_recommendations]
            
#             # Get the recipes
#             recipes = db.query(Recipe).filter(Recipe.recipe_id.in_(recipe_ids)).all()
            
#             # Update status to 'shown'
#             for rec in pending_recommendations:
#                 rec.status = 'shown'
            
#             db.commit()
#             return recipes
        
#         # No pending recommendations, use the simple approach
#         return generate_simple_recommendations(db, user_id, limit)
#     except Exception as e:
#         db.rollback()
#         print(f"Error in get_next_recommendations: {e}")
#         # Final fallback - get random recipes without any filtering
#         try:
#             from sqlalchemy.sql import text
#             result = db.execute(
#                 text("SELECT recipe_id FROM recipes ORDER BY DBMS_RANDOM.VALUE FETCH FIRST :limit ROWS ONLY"),
#                 {"limit": limit}
#             )
#             recipe_ids = [row[0] for row in result]
#             return db.query(Recipe).filter(Recipe.recipe_id.in_(recipe_ids)).all()
#         except Exception as inner_e:
#             print(f"Final fallback failed: {inner_e}")
#             return []

# old version using procedures
def get_next_recommendations(db: Session, user_id: int, limit: int = 10):
    """Get next batch of recommendations using the database procedure."""
    
    connection = db.get_bind().raw_connection()
    cursor = connection.cursor()
    
    # Create an output cursor variable
    output_cursor = connection.cursor()
    
    try:
        # Call the stored procedure
        cursor.callproc(
            "get_next_recommendations", 
            [user_id, limit, output_cursor]
        )
        
        # Fetch results from the output cursor
        recipe_data = []
        for row in output_cursor:
            # Map the row to a dictionary
            recipe_data.append({
                "recipe_id": row[0],
                "title": row[1], 
                "description": row[2],
                "image_url": row[3],
                "recommendation_score": row[4],
                # add other fields if we need as well
            })
        
        # Get the actual recipe objects from the database
        if recipe_data:
            recipe_ids = [r["recipe_id"] for r in recipe_data]
            recipes = db.query(Recipe).filter(Recipe.recipe_id.in_(recipe_ids)).all()
            
            # Add average rating and total ratings to each recipe
            for recipe in recipes:
                # reviews = db.query(recipe.reviews).filter_by(recipe_id=recipe.recipe_id).all()
                reviews = db.query(Review).filter(Review.recipe_id == recipe.recipe_id).all()
                recipe.total_ratings = len(reviews)
                recipe.average_rating = sum(review.rating for review in reviews) / len(reviews) if reviews else None
            
            return recipes
        
        return []
    
    finally:
        cursor.close()
        output_cursor.close()
        connection.close()

def record_interaction(db: Session, user_id: int, recipe_id: int, interaction_type: str):
    """Record interaction using the database procedure."""
    db.execute(
        text("BEGIN record_interaction(:user_id, :recipe_id, :interaction_type); END;"),
        {
            "user_id": user_id, 
            "recipe_id": recipe_id, 
            "interaction_type": interaction_type
        }
    )
    db.commit()


