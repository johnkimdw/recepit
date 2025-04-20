# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

Users Table
    users(user_id, username, email, password_hash, created_at)

Follows Table
    follows(follower_id, following_id)

Recipes Table
    recipes(recipe_id, user_id (foreign relation to the Users table), title, description, instructions, prep_time, cook_time, difficulty, image_url, created_at, updated_at)

Ingredients Table
    ingredients (ingredient_id, name, calories, image_url)

Categories Table
    categories (category_id, name)

Recipe Ingredients Relationship (Contains) Table
    recipe_ingredients (recipe_id, ingredient_id, quantity, unit);
// recipe_id has foreign relationship to the Recipes Table, and ingredient_id has foreign relationship to the Ingredient Table

Recipe Categories Relationship (Belongs) Table
    recipe_categories (recipe_id, category_id);
// recipe_id has foreign relationship to the Recipes Table, and category_id has foreign relationship to the Categories Table

Favorites Table
    favorites (user_id, recipe_id, saved_at);
// recipe_id has foreign relationship to the Recipes Table, and user_id has foreign relationship to the Users Table

Reviews Table
    reviews (review_id, user_id, recipe_id, rating, comment, created_at);
// recipe_id has foreign relationship to the Recipes Table, and user_id has foreign relationship to the Users Table
