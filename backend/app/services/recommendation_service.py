# app/services/recommendation_service.py
from sqlalchemy.orm import Session
from sqlalchemy import text
import cx_Oracle
from typing import List, Dict, Any

from app.models.recipe import Recipe
from app.models.review import Review
from app.models.user import User

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

def generate_recommendations(db: Session, user_id: int, count: int = 20):
    """Call the database procedure to generate recommendations."""
    db.execute(
        text("BEGIN generate_recommendations(:user_id, :count); END;"),
        {"user_id": user_id, "count": count}
    )
    db.commit()

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
                # You might need to adjust this based on your actual schema
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


