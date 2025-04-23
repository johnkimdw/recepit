import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ImageSourcePropType,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "@/config";
// [objectId].tsx is a dynamic route s.t. objectId becomes the recipe ID when user navigates to this screen
// sends http request to backend for recipe info
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Category {
  id: string;
  name: string;
}

interface User {
  username: string;
  email: string;
  user_id: number;
  created_at: string;
}

interface Recipe {
  recipe_id: string;
  user_id: string;
  title: string;
  description: string;
  instructions: string[];
  ingredients: Ingredient[];
  categories: Category[];
  user: User;
  prep_time: number;
  cook_time: number;
  difficulty: string;
  image_url: ImageSourcePropType;
  created_at: string;
  updated_at: string;
  average_rating: number;
  reviews_count: number;
  favorites_count: number;
}

const api_recipe_url = API_URL + "/recipes";

export default function RecipeDetailScreen() {
  const { objectId } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${api_recipe_url}/details/${objectId}`);
        const data = await response.json();
        data.instructions = data.instructions.split("\n");
        console.log(data);
        setRecipe(data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (objectId) {
      fetchRecipeDetails();
    }
  }, [objectId]);

  const handleShare = async () => {
    console.log("Sharing recipe");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D98324" />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      ) : recipe ? (
        <ScrollView style={styles.scrollContainer}>
          {/* Recipe Image */}
          <Image source={recipe.image_url} style={styles.recipeImage} />

          {/* Recipe Title and Ratings */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{recipe.title}</Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingNumber}>{recipe.average_rating}</Text>
              <View style={styles.starsContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={18}
                    color={i < recipe.average_rating ? "#D98324" : "#D9D9D9"}
                  />
                ))}
              </View>
              <Text style={styles.totalRatings}>
                ({recipe.reviews_count})
              </Text>
              <Text style={styles.totalRatings}>
                <Text
                  onPress={() => router.push(`/profile/${recipe.user_id}`)}
                  style={{ textDecorationLine: "underline", marginLeft: 10 }}
                >
                  By {recipe.user.username}
                </Text>
              </Text>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recipe.categories.map((category) => (
                <View key={category.id} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{category.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Cooking Times */}
          <View style={styles.timingContainer}>
            <View style={styles.timeDetails}>
              <Text style={styles.timeText}>
                Prep time: {recipe.prep_time} minutes
              </Text>
              <Text style={styles.timeText}>
                Cook time: {recipe.cook_time} minutes
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>

          {/* Ingredients */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>
                  • {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Difficulty */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Difficulty</Text>
            <Text style={styles.sectionContent}>{recipe.difficulty}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#555",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  recipeImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    fontFamily: "Lora-Regular",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 6,
    fontFamily: "Lora-Regular",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 6,
  },
  totalRatings: {
    fontSize: 16,
    color: "#666",
  },
  categoriesContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryTag: {
    backgroundColor: "#D98324",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  timingContainer: {
    padding: 16,
    backgroundColor: "#EFDCAB",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  totalTime: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 16,
    color: "#555",
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  ingredientItem: {
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D98324",
    width: 30,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    flex: 1,
  },
  bottomSpace: {
    height: 80,
  },
});
