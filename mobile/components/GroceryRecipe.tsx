import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImageSourcePropType } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface Ingredient {
  name: string;
  quantity: number;
}

interface GroceryRecipe {
  recipe_id: string;
  title: string;
  ingredients: Ingredient[];
  image_url: string;
}

const GroceryRecipe = ({
  item,
  expandedRecipes,
  toggleRecipeExpansion,
  toggleRecipeDeletion,
}: {
  item: GroceryRecipe;
  expandedRecipes: Set<string>;
  toggleRecipeExpansion: (recipeId: string) => void;
  toggleRecipeDeletion: (recipeId: string) => void;
}) => {
  const isExpanded = expandedRecipes.has(item.recipe_id);

  return (
    <View style={styles.groceryRecipeContainer}>
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => toggleRecipeExpansion(item.recipe_id)}
      >
        <View style={styles.recipeImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.recipeImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="restaurant-outline" size={24} color="#D98324" />
            </View>
          )}
        </View>
        <View style={styles.recipeDetails}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          {item.ingredients && item.ingredients.length > 0 && !isExpanded && (
            <View style={styles.ingredientsList}>
              {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                <Text
                  key={`${item.recipe_id}-ing-${idx}`}
                  style={styles.ingredientText}
                >
                  {ingredient.quantity ? `${ingredient.quantity} x ` : ""}
                  {ingredient.name}
                </Text>
              ))}
              {item.ingredients.length > 3 && (
                <Text style={styles.moreIngredientsText}>
                  +{item.ingredients.length - 3} more
                </Text>
              )}
            </View>
          )}
          {!isExpanded && (
            <View style={styles.expandIndicator}>
              <Ionicons name="chevron-down" size={16} color="#999" />
            </View>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => toggleRecipeDeletion(item.recipe_id)}
          >
            <MaterialIcons name="delete" size={16} color="grey" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {isExpanded && item.ingredients && item.ingredients.length > 0 && (
        <View style={styles.expandedIngredientsContainer}>
          {item.ingredients.map((ingredient, idx) => (
            <View
              style={styles.expandedIngredientRow}
              key={`${item.recipe_id}-expanded-ing-${idx}`}
            >
              <Text style={styles.expandedIngredientText}>
                {ingredient.quantity ? `${ingredient.quantity} x ` : ""}
                {ingredient.name}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={() => toggleRecipeExpansion(item.recipe_id)}
          >
            <Text style={styles.collapseButtonText}>Collapse</Text>
            <Ionicons name="chevron-up" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groceryRecipeContainer: {
    marginBottom: 15,
    width: "100%",
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recipeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  recipeDetails: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 20,
    justifyContent: "center",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  ingredientsList: {
    flexDirection: "column",
  },
  ingredientText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  moreIngredientsText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  expandIndicator: {
    position: "absolute",
    right: 0,
    bottom: 0,
    padding: 5,
  },
  expandedIngredientsContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: -5,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingBottom: 12,
    paddingTop: 5,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  expandedIngredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  expandedIngredientText: {
    fontSize: 15,
    color: "#333",
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 5,
  },
  collapseButtonText: {
    fontSize: 14,
    color: "#999",
    marginRight: 5,
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 5,
  },
});

export default GroceryRecipe;
