import React, { useEffect, useState, useRef } from "react";
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
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "@/config";
import { useApi } from "@/hooks/useApi";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface Ingredient {
  name: string;
  quantity: number;
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

interface Review {
  recipe_id: number;
  rating: number;
  comment: string;
  review_id: number;
  user_id: number;
  user_name: string;
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
  reviews: Review[];
  user: User;
  prep_time: number;
  cook_time: number;
  difficulty: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  average_rating: number;
  reviews_count: number;
  favorites_count: number;

  is_saved: boolean;
}

const api_recipe_url = API_URL + "/recipes";

export default function RecipeDetailScreen() {
  const { objectId } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToGrocery, setIsAddedToGrocery] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const { apiCall } = useApi();

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiCall(`${api_recipe_url}/details/${objectId}`);
        const data = await response.json();
        data.instructions = data.instructions.split("\n");
        console.log(data);
        setRecipe(data);
        setIsSaved(data.is_saved);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setError("Please login to view this recipe");
      } finally {
        setIsLoading(false);
      }
    };

    const checkIfAddedToGrocery = async () => {
      const jsonValue = await AsyncStorage.getItem("@grocery_recipe_ids");
      if (jsonValue != null) {
        const groceryRecipeIds = JSON.parse(jsonValue);
        setIsAddedToGrocery(groceryRecipeIds.includes(objectId));
      }
    };

    if (objectId) {
      fetchRecipeDetails();
      checkIfAddedToGrocery();
    }
  }, [objectId]);

  const handleShare = async () => {
    console.log("Sharing recipe");
  };

  const handleBack = () => {
    router.back();
  };

  const toggleSave = async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(async () => {
      if (isSaved) {
        await apiCall(`${api_recipe_url}/unsave/${objectId}`, {
          method: "PATCH",
        });
      } else {
        await apiCall(`${api_recipe_url}/save/${objectId}`, {
          method: "PATCH",
        });
      }
    }, 1000);
    setIsSaved(!isSaved);
  };

  const toggleAddToGrocery = async () => {
    const jsonValue = await AsyncStorage.getItem("@grocery_recipe_ids");
    if (jsonValue != null) {
      const groceryRecipeIds = JSON.parse(jsonValue);
      if (groceryRecipeIds.includes(objectId)) {
        await AsyncStorage.setItem(
          "@grocery_recipe_ids",
          JSON.stringify(
            groceryRecipeIds.filter((id: string) => id !== objectId)
          )
        );
      } else {
        await AsyncStorage.setItem(
          "@grocery_recipe_ids",
          JSON.stringify([...groceryRecipeIds, objectId])
        );
      }
    } else {
      await AsyncStorage.setItem(
        "@grocery_recipe_ids",
        JSON.stringify([objectId])
      );
    }
    setIsAddedToGrocery(!isAddedToGrocery);
  };

  const toggleExpandReview = (reviewId: number) => {
    setExpandedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleRatingPress = (rating: number) => {
    setUserRating(rating);
  };

  const submitReview = async () => {
    if (userRating === 0) {
      // Show an error or alert that rating is required
      console.log("Please select a rating");
      setSubmitError("Please select a rating");
      return;
    }

    console.log("Submitting review:", { userRating, userComment });

    try {
      setSubmitLoading(true);
      const response = await apiCall(`${api_recipe_url}/reviews/${objectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: userRating, comment: userComment }),
      });
      const data: Review = await response.json();
      console.log(data);

      setUserComment("");
      setUserRating(0);
      setSubmitError("");

      if (response.ok && recipe) {
        recipe.reviews.unshift(data);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitError("Error submitting review");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: recipe.image_url }}
              style={styles.recipeImage}
            />

            <View style={styles.groceryButtonContainer}>
              <Ionicons
                name={isAddedToGrocery ? "cart-sharp" : "cart-outline"}
                size={18}
                color="#D98324"
                onPress={toggleAddToGrocery}
              />
            </View>

            <View style={styles.saveButtonContainer}>
              <Ionicons
                name={isSaved ? "star" : "star-outline"}
                size={18}
                color="#D98324"
                onPress={toggleSave}
              />
            </View>
          </View>

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
              <Text style={styles.totalRatings}>({recipe.reviews_count})</Text>
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
                  • {ingredient.quantity} {ingredient.name}
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

          {/* Reviews Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Reviews</Text>

            {/* Add Review Form */}
            <View style={styles.addReviewContainer}>
              <Text style={styles.addReviewTitle}>Add Your Review</Text>

              {/* Star Rating Selection */}
              <View style={styles.ratingInputContainer}>
                <Text style={styles.ratingInputLabel}>Your Rating:</Text>
                <View style={styles.starInputContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleRatingPress(star)}
                    >
                      <Ionicons
                        name={userRating >= star ? "star" : "star-outline"}
                        size={30}
                        color="#D98324"
                        style={styles.starInput}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Comment Input */}
              <TextInput
                style={styles.commentInput}
                placeholder="Write your comment (optional)"
                multiline
                numberOfLines={4}
                value={userComment}
                onChangeText={setUserComment}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReview}
              >
                {submitLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>

              {submitError && (
                <Text style={styles.submitErrorText}>{submitError}</Text>
              )}
            </View>

            {/* User Reviews */}
            <View style={styles.userReviewsContainer}>
              <Text style={styles.userReviewsTitle}>
                User Reviews ({recipe.reviews.length})
              </Text>

              {recipe.reviews.length > 0 ? (
                recipe.reviews.map((review) => (
                  <View key={review.review_id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewUsername}>
                        {review.user_name}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={16}
                          color={i < review.rating ? "#D98324" : "#D9D9D9"}
                        />
                      ))}
                    </View>

                    {review.comment && (
                      <View>
                        <TouchableOpacity
                          onPress={() => toggleExpandReview(review.review_id)}
                          style={styles.commentToggle}
                        >
                          <Text style={styles.commentToggleText}>
                            {expandedReviews.includes(review.review_id)
                              ? "Hide Comment"
                              : "Show Comment"}
                          </Text>
                          <Ionicons
                            name={
                              expandedReviews.includes(review.review_id)
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={16}
                            color="#666"
                          />
                        </TouchableOpacity>

                        {expandedReviews.includes(review.review_id) && (
                          <Text style={styles.reviewComment}>
                            {review.comment}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noReviewsText}>
                  No reviews yet. Be the first to review!
                </Text>
              )}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
  imageContainer: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
    position: "relative",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 8,
    right: 12,
    backgroundColor: "#E0E0E0",
    padding: 4,
    borderRadius: 100,
  },
  groceryButtonContainer: {
    position: "absolute",
    bottom: 8,
    right: 50,
    backgroundColor: "#E0E0E0",
    padding: 4,
    borderRadius: 100,
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
  addReviewContainer: {
    backgroundColor: "#FFFDFA",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addReviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  ratingInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingInputLabel: {
    fontSize: 16,
    marginRight: 10,
    color: "#333",
  },
  starInputContainer: {
    flexDirection: "row",
  },
  starInput: {
    marginRight: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  submitButton: {
    backgroundColor: "#D98324",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  userReviewsContainer: {
    marginTop: 20,
  },
  userReviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  reviewItem: {
    backgroundColor: "#FFFDFA",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewUsername: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  reviewDate: {
    color: "#888",
    fontSize: 14,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: 8,
  },
  commentToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  commentToggleText: {
    color: "#666",
    marginRight: 5,
    fontSize: 14,
  },
  reviewComment: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
  noReviewsText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  bottomSpace: {
    height: 80,
  },
  submitErrorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
