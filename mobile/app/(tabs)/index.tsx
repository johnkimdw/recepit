import RecipeCard from "@/components/RecipeCard";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Image,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useRecommendations } from "@/hooks/useRecommendation";

// Define Recipe type
interface Recipe {
  id: number;
  image: any;
  title: string;
  rating: number;
  totalRatings: number;
  prepTime: string;
  cookTime: string;
  description: string;
}

export default function IndexScreen() {
  const {
    recipes,
    loading,
    error, // NEW: Added error state from hook
    recordInteraction,
    refreshRecommendations
  } = useRecommendations();

  // State to track current recipes
  // const [recipes, setRecipes] = useState<Recipe[]>(recipesData);


  // Animation values for the empty state
  const emptyStateOpacity = useSharedValue(0);
  const emptyStateScale = useSharedValue(0.8);

  // Update animation values when recipes change
  useEffect(() => {

    console.log(`Number recipes: ${recipes.length}`)

    if (recipes.length === 0) {
      // Animate in when no recipes
      emptyStateOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      emptyStateScale.value = withSpring(1, {
        mass: 0.5,
        stiffness: 150,
        damping: 15,
      });
    } else {
      // Reset when recipes are available
      emptyStateOpacity.value = 0;
      emptyStateScale.value = 0.8;
    }
  }, [recipes.length]);

  // Animated styles for the empty state
  const emptyStateAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: emptyStateOpacity.value,
      transform: [{ scale: emptyStateScale.value }],
    };
  });


  // const handleIgnore = (recipe: Recipe) => {
  //   //Alert.alert("Ignored", `${recipe.title} has been ignored`);
  //   // Remove the swiped recipe
  //   setRecipes((currentRecipes) =>
  //     currentRecipes.filter((item) => item.id !== recipe.id)
  //   );
  // };
  const handleIgnore = async (recipe: any) => {
    await recordInteraction(recipe.recipe_id, "dislike");
  };

  // const handleLike = (recipe: Recipe) => {
  //   //Alert.alert("Liked", `${recipe.title} has been added to your favorites`);
  //   // Remove the swiped recipe
  //   setRecipes((currentRecipes) =>
  //     currentRecipes.filter((item) => item.id !== recipe.id)
  //   );
  // };

  const handleLike = async (recipe: any) => {
    await recordInteraction(recipe.recipe_id, "like");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 0.4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
          alignSelf: "flex-start",
          marginLeft: 25,
          gap: 10,
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 40, height: 40 }}
        />
        <Text style={styles.title}>Receipt</Text>
      </View>

      <View style={{ height: "70%", width: "90%", marginVertical: 10 }}>
        {/* loading  */}
        {loading && recipes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) 
        /* NEW: Added error state UI */
        : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshRecommendations}
            >
              <Text style={styles.refreshButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) 
        : recipes.length > 0 ? (
          <View style={styles.cardStack}>
            {recipes.map((recipe, index) => (
              <View
                key={recipe.recipe_id}
                style={[
                  styles.cardWrapper,
                  {
                    zIndex: recipes.length - index, // Stack order
                  },
                ]}
              >
                <RecipeCard
                  recipe_id={recipe.recipe_id.toString()}
                  image={recipe.image_url ? { uri: recipe.image_url } : require("@/assets/images/default-recipe.png")}
                  title={recipe.title}
                  rating={recipe.average_rating || 0}
                  totalRatings={recipe.total_ratings || 0}
                  // totalTime={recipe.prep_time && recipe.cook_time ? 
                  //   `${parseInt(recipe.prep_time) + parseInt(recipe.cook_time)} minutes` : 
                  //   "30 minutes"}
                  prepTime={recipe.prep_time || "15 minutes"}
                  cookTime={recipe.cook_time || "15 minutes"}
                  description={recipe.description}
                  onLike={() => handleLike(recipe)}
                  onIgnore={() => handleIgnore(recipe)}
                  isActiveCard={index === 0}
                />
                {/* <RecipeCard
                  recipe_id={recipe.id.toString()}
                  image={recipe.image}
                  title={recipe.title}
                  rating={recipe.rating}
                  totalRatings={recipe.totalRatings}
                  prepTime={recipe.prepTime}
                  cookTime={recipe.cookTime}
                  description={recipe.description}
                  onLike={() => handleLike(recipe)}
                  onIgnore={() => handleIgnore(recipe)}
                  isActiveCard={index === 0} // Only the top card is interactive
                /> */}
              </View>
            ))}
          </View>
        ) : (
          <Animated.View style={[styles.noRecipes, emptyStateAnimatedStyle]}>
            <Text style={styles.noRecipesText}>No more recipes to show!</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshRecommendations}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.instructionText}>
        <Text style={styles.instruction}>
          Swipe right to like, left to ignore
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F5E9",
  },
  title: {
    fontFamily: "Lora-Bold",
    fontSize: 24,
    fontWeight: "bold",
    color: "#D98324",
  },
  cardStack: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  cardWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  instructionText: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "#EFDCAB",
    borderRadius: 20,
  },
  instruction: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  noRecipes: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFDCAB",
    borderRadius: 12,
  },
  noRecipesText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: "#D98324",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFEEEE",
    borderRadius: 12,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 20,
  }
});
