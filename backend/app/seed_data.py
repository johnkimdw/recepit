from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.category import Category
from app.models.favorite import Favorite
from app.models.review import Review
import os
import json
from tqdm import tqdm
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
from app.core.config import Settings

settings = Settings()

openai_api_key = settings.OPENAI_API_KEY

def seed_data():
    """
    Add sample or initial data to the database.
    This function can be run as a standalone script for one-time operations.
    """
    # Create a new session
    db = SessionLocal()

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "kaggle_data")
    data_jsons = os.listdir(DATA_DIR)
    current_data_json = None
    current_index = 0
    try:
        official_user = db.query(User).filter(User.username == "receipt").first()
        if not official_user:
            # create a "official" user of receipt for all the following recipes
            print("Creating official user...")
            official_user = User(
                username="receipt",
                email="receipt@receipt.com",
                password_hash="password_hash",
            )
            db.add(official_user)
            db.commit()
        
        # Keep track of ingredients we've seen to avoid duplicates
        ingredient_cache = {}
        
        for data_json in data_jsons[2:]:
            current_index = 0
            current_data_json = data_json
            with open(os.path.join(DATA_DIR, data_json), "r") as f:
                recipes = json.load(f)
                batch_size = 20  # Commit every 20 recipes
                batch_count = 0
                
                for recipe in tqdm(sorted(recipes, key=lambda x: x["id"]), desc=f"Processing recipes {data_json}"):
                    image_url = recipe["image"]
                    title = recipe["name"]
                    description = recipe["description"]
                    rating = int(recipe["rattings"])
                    
                    # De-duplicate ingredients while preserving order
                    seen_ingredients = set()
                    unique_ingredients = []
                    for ing in recipe["ingredients"]:
                        ing_normalized = ing.strip()
                        # Skip empty ingredient names (Oracle treats empty strings as NULL)
                        if ing_normalized and ing_normalized not in seen_ingredients:
                            seen_ingredients.add(ing_normalized)
                            unique_ingredients.append(ing)
                    ingredients = unique_ingredients
                    
                    # Convert list of steps to a formatted string with numbered steps
                    step_list = recipe["steps"]
                    if isinstance(step_list, list):
                        instructions = "\n".join([step for step in step_list])
                    else:
                        instructions = str(step_list)  # Fallback if not a list
                    if "Cooking" in recipe["times"]:
                        cook_time = str(recipe["times"]["Cooking"])  # Ensure it's a string
                    else:
                        cook_time = "0"  # Use string "0" instead of numeric 0
                    if "Preparation" in recipe["times"]:
                        prep_time = str(recipe["times"]["Preparation"])  # Ensure it's a string
                    else:
                        prep_time = "0"  # Use string "0" instead of numeric 0
                    difficulty = recipe["difficult"]
                    category = recipe["maincategory"]

                    # print("image_url: ", image_url, "\n"
                    #       "title: ", title, "\n"
                    #       "description: ", description, "\n"
                    #       "rating: ", rating, "\n"
                    #       "ingredients: ", ingredients, "\n"
                    #       "instructions: ", instructions, "\n"
                    #       "cook_time: ", cook_time, "\n"
                    #       "prep_time: ", prep_time, "\n"
                    #       "difficulty: ", difficulty, "\n"
                    #       "category: ", category)
                
                    recipe = Recipe(
                        title=title,
                        description=description,
                        instructions=instructions,
                        prep_time=prep_time,
                        cook_time=cook_time,
                        difficulty=difficulty,
                        image_url=image_url,
                    )

                    recipe.user = official_user

                    for ingredient in ingredients:
                        # Normalize ingredient name by trimming whitespace
                        ingredient_name = ingredient.strip()
                        
                        # Skip empty ingredient names
                        if not ingredient_name:
                            continue
                            
                        # Check our in-memory cache first
                        if ingredient_name in ingredient_cache:
                            ingredient_object = ingredient_cache[ingredient_name]
                        else:
                            # Query the database for this ingredient
                            ingredient_object = db.query(Ingredient).filter(Ingredient.name == ingredient_name).first()
                            
                            if not ingredient_object:
                                # Create new ingredient
                                ingredient_object = Ingredient(
                                    name=ingredient_name,
                                )
                                db.add(ingredient_object)
                                # Flush to get the ID without committing
                                db.flush()
                            
                            # Store in our cache
                            ingredient_cache[ingredient_name] = ingredient_object
                        
                        recipe_ingredient = RecipeIngredient(
                            recipe=recipe,
                            ingredient=ingredient_object,
                        )
                        db.add(recipe_ingredient)

                    category_object = db.query(Category).filter(Category.name == category).first()
                    if not category_object:
                        category_object = Category(
                            name=category,
                        )
                        db.add(category_object)
                    
                    # Check if the category is already associated with the recipe before adding
                    if category_object not in recipe.categories:
                        recipe.categories.append(category_object)
                    
                    db.add(recipe)

                    review_object = Review(
                        recipe=recipe,
                        user=official_user,
                        rating=rating,
                    )
                    db.add(review_object)

                    current_index += 1  # succeed in adding the item into the database
                    batch_count += 1
                    
                    # Commit in batches to avoid extremely large transactions
                    if batch_count >= batch_size:
                        try:
                            db.commit()
                            print(f"Committed batch of {batch_count} recipes (total: {current_index})")
                            batch_count = 0
                        except Exception as e:
                            db.rollback()
                            print(f"Error committing batch: {e}")
                            raise  # Re-raise to be caught by the outer exception handler

                # Commit any remaining items in the last partial batch
                if batch_count > 0:
                    db.commit()
                    print(f"Committed final batch of {batch_count} recipes (total: {current_index})")

    except Exception as e:
        # Roll back the session in case of error
        db.rollback()
        print(f"Error seeding database: {e}")
        print(current_data_json, current_index)
    finally:
        # Close the session - no need to commit here since we're committing in batches
        db.close()
        print("Database seeding completed!")
        print(f"Last processed file: {current_data_json}, records: {current_index}")

def separate_ingredient_name(ingredient_name):
    client = OpenAI(api_key=openai_api_key)
    response = client.responses.create(
        model="gpt-4.1-nano",
        instructions = "You are a helpful cook that can separate string into 2 parts: the ingredient name and the quantity.",
        input = '''Please separate "''' +ingredient_name + '''" into 2 parts: the ingredient name and the quantity(Must have number in it). if cannot find quantity, just use 1 and a unit to represent the quantity. The response format should be {\"name\": \"ingredient_name\", \"quantity\": \"quantity\"}.''',
    )

    try:
        # First try direct JSON parsing
        text = response.output[0].content[0].text
        
        # Debug log
        #print(f"Raw response for '{ingredient_name}': {text}")
        
        # First, check if result is already a valid JSON string
        try:
            result = json.loads(text)
            
            # Check if result is a dictionary with the expected keys
            if isinstance(result, dict) and "name" in result and "quantity" in result:
                return result["name"], result["quantity"]
            # If result is a list, try to find a dictionary in it
            elif isinstance(result, list) and len(result) > 0:
                for item in result:
                    if isinstance(item, dict) and "name" in item and "quantity" in item:
                        return item["name"], item["quantity"]
                # If we got here, no usable dictionary was found in the list
                print(f"Result is a list but no usable dict found: {result}")
                
        except json.JSONDecodeError:
            pass
            
        # Extract JSON using regex as a fallback
        import re
        
        # Look for JSON pattern in the response
        json_pattern = r'(\{.*\})'
        matches = re.search(json_pattern, text, re.DOTALL)
        if matches:
            try:
                json_str = matches.group(1)
                result = json.loads(json_str)
                print("Processed result: ", result)
                if isinstance(result, dict) and "name" in result and "quantity" in result:
                    return result["name"], result["quantity"]
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Failed to extract JSON with regex: {e}")
        
        # If all else fails, make a best effort to parse manually
        name_match = re.search(r'"name":\s*"([^"]+)"', text)
        quantity_match = re.search(r'"quantity":\s*"([^"]+)"', text)
        
        if name_match and quantity_match:
            return name_match.group(1), quantity_match.group(1)
        
        # Last resort fallback
        return ingredient_name, "1 unit"
    except Exception as e:
        print(f"Unexpected error processing '{ingredient_name}': {e}")
        return ingredient_name, "1 unit"

def process_ingredients():
    """
    Process ingredients from the JSON files and add them to the database.
    """
    db = SessionLocal()
    batch_size = 20
    current_index = 0

    # traverse all the ingredients in the ingredient table, sort the ingredient
    ingredients = db.query(Ingredient).all()
    ingredients.sort(key=lambda x: x.ingredient_id)
    for ingredient in tqdm(ingredients[3780:], desc="Processing ingredients"):
        # find the corresponding recipeIngredient
        recipe_ingredient = db.query(RecipeIngredient).filter(RecipeIngredient.ingredient_id == ingredient.ingredient_id).first()

        if not recipe_ingredient:
            continue

        name, quantity = separate_ingredient_name(ingredient.name)
        name = name.strip()
        quantity = quantity.strip()
        # check if the name exists before
        existing_ingredient = db.query(Ingredient).filter(Ingredient.name == name).first()
        if existing_ingredient:
            recipe_ingredient.ingredient = existing_ingredient
        else:
            ingredient.name = name
        recipe_ingredient.quantity = quantity

        db.add_all([ingredient, recipe_ingredient])
        current_index += 1
        if current_index % batch_size == 0:
            try:
                db.commit()
                print(f"Committed batch of {batch_size} ingredients (total: {current_index})")
            except Exception as e:
                db.rollback()
                print(f"Error committing batch: {e}")
                print("name is: ", name)
                print("quantity is: ", quantity)
                print("existing_ingredient is: ", existing_ingredient)
                print(f"Current index: {current_index}")
                continue
    
    try:
        db.commit()
        print(f"Committed final batch of {current_index} ingredients (total: {current_index})")
    except Exception as e:
        db.rollback()
        print(f"Error committing final batch: {e}")
        raise  # Re-raise to be caught by the outer exception handler
    

if __name__ == "__main__":
    #seed_data() 
    process_ingredients()