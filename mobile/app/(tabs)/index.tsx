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
  // Sample recipe data
  const recipesData: Recipe[] = [
    {
      id: 1,
      image: require("@/assets/images/spicy-tomato.jpg"),
      title: "Coconut Fish and Tomato Bake",
      rating: 4,
      totalRatings: 10184,
      prepTime: "10 minutes",
      cookTime: "20 minutes",
      description:
        "A coconut-milk dressing infused with garlic, ginger, turmeric and lime coats fish fillets in this sheet-pan dinner. Accompanying the fish are bright bursts of tomatoes which turn jammy",
    },
    {
      id: 2,
      image: require("@/assets/images/spicy-tomato.jpg"),
      title: "Spicy Vegetable Curry",
      rating: 5,
      totalRatings: 8742,
      prepTime: "15 minutes",
      cookTime: "30 minutes",
      description:
        "This vibrant vegetable curry brings together a colorful blend of seasonal vegetables in a rich, aromatic sauce that's perfectly balanced with warm spices.",
    },
    {
      id: 3,
      image: require("@/assets/images/spicy-tomato.jpg"),
      title: "Classic Beef Stew",
      rating: 4.5,
      totalRatings: 6531,
      prepTime: "20 minutes",
      cookTime: "1 hour 40 minutes",
      description:
        "A hearty beef stew made with tender chunks of beef, carrots, potatoes, and a rich savory broth. Perfect comfort food for chilly evenings.",
    },
  ];

  // State to track current recipes
  const [recipes, setRecipes] = useState<Recipe[]>(recipesData);


  // Animation values for the empty state
  const emptyStateOpacity = useSharedValue(0);
  const emptyStateScale = useSharedValue(0.8);

  // Update animation values when recipes change
  useEffect(() => {
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

  useEffect(() => {
    console.log("Platform:", Platform.OS);
  }, []);

  const handleIgnore = (recipe: Recipe) => {
    //Alert.alert("Ignored", `${recipe.title} has been ignored`);
    // Remove the swiped recipe
    setRecipes((currentRecipes) =>
      currentRecipes.filter((item) => item.id !== recipe.id)
    );
  };

  const handleLike = (recipe: Recipe) => {
    //Alert.alert("Liked", `${recipe.title} has been added to your favorites`);
    // Remove the swiped recipe
    setRecipes((currentRecipes) =>
      currentRecipes.filter((item) => item.id !== recipe.id)
    );
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
        <Text style={styles.title}>Social Cooking</Text>
      </View>

      <View style={{ height: "70%", width: "90%", marginVertical: 10 }}>
        {recipes.length > 0 ? (
          <View style={styles.cardStack}>
            {recipes.map((recipe, index) => (
              <View
                key={recipe.id}
                style={[
                  styles.cardWrapper,
                  {
                    zIndex: recipes.length - index, // Stack order
                  },
                ]}
              >
                <RecipeCard
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
                />
              </View>
            ))}
          </View>
        ) : (
          <Animated.View style={[styles.noRecipes, emptyStateAnimatedStyle]}>
            <Text style={styles.noRecipesText}>No more recipes to show!</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => setRecipes(recipesData)}
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
});
