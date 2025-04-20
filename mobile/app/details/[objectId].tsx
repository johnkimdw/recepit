import React from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

interface Recipe {
  recipe_id: string;
  user_id: string;
  title: string;
  description: string;
  instructions: string[];
  prep_time: number;
  cook_time: number;
  difficulty: string;
  image_url: ImageSourcePropType;
  created_at: string;
  updated_at: string;
  rating: number;
  total_ratings: number;
}

export default function RecipeDetailScreen() {
  const { objectId } = useLocalSearchParams();
  const router = useRouter();

  // Placeholder recipe data
  const recipe: Recipe = {
    recipe_id: objectId as string,
    user_id: "user123",
    title: "Coconut Fish and Tomato Bake",
    description:
      "A coconut-milk dressing infused with garlic, ginger, turmeric and lime coats fish fillets in this sheet-pan dinner. Accompanying the fish are bright bursts of tomatoes which turn jammy when roasted.",
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "In a bowl, whisk together coconut milk, minced garlic, grated ginger, turmeric, lime juice, salt, and pepper.",
      "Place fish fillets in a baking dish and pour the coconut mixture over them.",
      "Arrange cherry tomatoes around the fish.",
      "Bake for 10-12 minutes until fish is cooked through and tomatoes have burst.",
      "Garnish with fresh cilantro and lime wedges before serving.",
    ],
    prep_time: 20,
    cook_time: 10,
    difficulty: "Easy",
    image_url: require("../../assets/images/pasta.png"), // TODO: need to use web url maybe, cannot be static like this
    created_at: "2023-10-15T14:30:00Z",
    updated_at: "2023-10-15T14:30:00Z",
    rating: 5,
    total_ratings: 9184,
  };

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

      <ScrollView style={styles.scrollContainer}>
        {/* Recipe Image */}
        <Image source={recipe.image_url} style={styles.recipeImage} />

        {/* Recipe Title and Ratings */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingNumber}>{recipe.rating}</Text>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={18}
                  color={i < recipe.rating ? "#D98324" : "#D9D9D9"}
                />
              ))}
            </View>
            <Text style={styles.totalRatings}>
              ({recipe.total_ratings.toLocaleString()})
            </Text>
            <Text style={styles.totalRatings}>
              <Text
                onPress={() => router.push(`/profile/${recipe.user_id}`)}
                style={{ textDecorationLine: "underline", marginLeft: 10 }}
              >
                By {recipe.user_id}
              </Text>
            </Text>
          </View>
        </View>

        {/* Cooking Times */}
        <View style={styles.timingContainer}>
          <Text style={styles.totalTime}>
            Total time: {recipe.prep_time + recipe.cook_time} minutes
          </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
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
