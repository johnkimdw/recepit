import React, { Fragment, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "@/config";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { router } from "expo-router";
import { Animated } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setActiveCategory,
  fetchCategoryRecipes,
  fetchFeaturedRecipe,
} from "@/store/recipeSlice";

type SmallRecipe = {
  recipe_id: number;
  title: string;
  image_url: string;
  average_rating: number;
  prep_time: string;
  cook_time: string;
  total_ratings: number;
};

const api_recipe_url = API_URL + "/recipes";

const categories = [
  //"New & For you", // TODO, need the recommendation
  // "Breakfast",
  // "Dessert",
  // "Lunch",
  // "Dinner",
  // "Snack",
  "Baking",
  "Budget",
  "Health",
  "Inspiration",
  "Recipes",
];

export default function BrowseScreen() {
  const dispatch = useAppDispatch();
  const {
    activeCategory,
    categoryCache,
    featuredRecipe,
    isFeaturedLoading,
    isCategoryLoading,
  } = useAppSelector((state) => state.recipes);

  // Search-related state
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SmallRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const timer = useRef<NodeJS.Timeout | null>(null);
  const { username } = useAuth();
  const [greeting, setGreeting] = useState("");

  const { userID } = useAuth();
  const { apiCall } = useApi();

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 20) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  useEffect(() => {
    if (!featuredRecipe) {
      dispatch(fetchFeaturedRecipe());
    }
  }, [dispatch, featuredRecipe]);

  useEffect(() => {
    if (categoryCache[activeCategory].length === 0) {
      dispatch(fetchCategoryRecipes(activeCategory));
    }
  }, [dispatch, activeCategory, categoryCache]);

  // Search functionality
  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `${api_recipe_url}/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      console.log(data);
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    timer.current = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);
  }, [searchQuery]);

  // Animate search bar
  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // if (isSearchMode) {
    //   setTimeout(() => searchInputRef.current?.focus(), 100);
    // }
  }, [isSearchMode]);

  const toggleSearchMode = () => {
    if (isSearchMode) {
      setSearchQuery("");
      setSearchResults([]);
    }
    setIsSearchMode(!isSearchMode);
  };

  useEffect(() => {
    console.log("username ", username);
  }, [username]);

  // Update category selection handler
  const handleCategoryPress = (category: string) => {
    dispatch(setActiveCategory(category));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with greeting and search */}
        <View style={styles.header}>
          {!isSearchMode ? (
            <>
              <View>
                <Text style={styles.greeting}>{`${greeting},\n${
                  (username || "Guest").charAt(0).toUpperCase() +
                  (username || "Guest").slice(1)
                }`}</Text>
              </View>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={toggleSearchMode}
              >
                <Ionicons name="search-outline" size={24} color="black" />
              </TouchableOpacity>
            </>
          ) : (
            <Animated.View
              style={[
                styles.searchContainer,
                {
                  width: searchAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["30%", "100%"],
                  }),
                },
              ]}
            >
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setSearchQuery("")}
                  >
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={toggleSearchMode}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Search Results */}
        {isSearchMode ? (
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <ActivityIndicator
                size="large"
                color="#D98324"
                style={styles.searchingIndicator}
              />
            ) : searchResults.length > 0 ? (
              <View style={styles.searchResultsList}>
                {searchResults.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.recipe_id}
                    style={styles.searchResultItem}
                    onPress={() => {
                      router.push(`/details/${recipe.recipe_id}`);
                    }}
                  >
                    <Image
                      source={{ uri: recipe.image_url }}
                      style={styles.searchResultImage}
                      defaultSource={require("@/assets/images/logo.png")}
                    />
                    <View style={styles.searchResultTextContainer}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>
                        {recipe.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <>
            {/* Featured Recipe */}
            <View style={styles.featuredContainer}>
              {isFeaturedLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#D98324" />
                </View>
              ) : (
                <Fragment>
                  <Pressable
                    onPress={() => {
                      router.push(`/details/${featuredRecipe?.recipe_id}`);
                    }}
                    style={styles.featuredImageContainer}
                  >
                    <Image
                      source={{ uri: featuredRecipe?.image_url }}
                      style={styles.featuredImage}
                      defaultSource={require("@/assets/images/logo.png")}
                    />

                    {/* Inner shadow using gradient overlays */}
                    <LinearGradient
                      colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]}
                      style={styles.innerShadowBottom}
                    />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}
                      style={styles.innerShadowTop}
                    />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0)"]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.innerShadowLeft}
                    />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0)"]}
                      start={{ x: 1, y: 0.5 }}
                      end={{ x: 0.8, y: 0.5 }}
                      style={styles.innerShadowRight}
                    />

                    <View style={styles.featuredTextOverlay}>
                      <Text style={styles.featuredText}>
                        {featuredRecipe?.title}
                      </Text>
                    </View>
                  </Pressable>
                </Fragment>
              )}
            </View>

            {/* Categories */}
            <View style={styles.HorizontalScrollViewWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      activeCategory === category &&
                        styles.activeCategoryButton,
                    ]}
                    onPress={() => handleCategoryPress(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        activeCategory === category &&
                          styles.activeCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recipe Grid */}
            <View style={styles.recipeSection}>
              {isCategoryLoading ? (
                <View style={styles.loadingCategoryContainer}>
                  <ActivityIndicator size="large" color="#D98324" />
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.recipesRow}>
                    {categoryCache[activeCategory].map((recipe) => (
                      <View
                        key={recipe.recipe_id}
                        style={{ width: 170, height: 170, marginRight: 10 }}
                      >
                        <RecipeCard
                          recipe_id={recipe.recipe_id.toString()}
                          title={recipe.title}
                          image={recipe.image_url}
                          rating={recipe.average_rating}
                          prepTime={recipe.prep_time}
                          cookTime={recipe.cook_time}
                          totalRatings={recipe.total_ratings}
                          isSmallCard={true}
                          isActiveCard={true}
                        />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  scrollViewContent: {
    alignItems: "center",
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    alignSelf: "stretch",
  },
  greeting: {
    fontSize: 32,
    color: "#D98324",
    fontFamily: "Lora-Bold",
  },
  searchButton: {
    padding: 10,
  },
  // Search styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
    alignSelf: "stretch",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 45,
    fontFamily: "Lora-Regular",
  },
  clearButton: {
    padding: 5,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cancelText: {
    color: "#D98324",
    fontSize: 16,
    fontFamily: "Lora-Bold",
  },
  searchResultsContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  searchingIndicator: {
    marginTop: 30,
  },
  searchResultsList: {
    width: "100%",
  },
  searchResultItem: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchResultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  searchResultTextContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  searchResultTitle: {
    fontSize: 16,
    fontFamily: "Lora-Bold",
    color: "#333",
    marginBottom: 8,
  },
  searchResultMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchResultRating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  searchResultTime: {
    fontSize: 14,
    color: "#666",
  },
  noResultsContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Lora-Regular",
  },
  featuredContainer: {
    marginTop: 20,
    width: 350,
    height: 350,
    position: "relative",
    overflow: "hidden",
  },
  loadingContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  innerShadowTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  innerShadowBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  innerShadowLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 80,
  },
  innerShadowRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 40,
  },
  featuredTextOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  featuredText: {
    color: "#F8F5E9",
    fontSize: 32,
    fontFamily: "Lora-Bold",
  },
  HorizontalScrollViewWrapper: {
    height: 70,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: "transparent",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  activeCategoryButton: {
    backgroundColor: "#D98324",
  },
  categoryText: {
    fontSize: 16,
    color: "#D98324",
    fontFamily: "Lora-Bold",
  },
  activeCategoryText: {
    fontSize: 16,
    color: "#F8F5E9",
    fontWeight: "500",
    fontFamily: "Lora-Bold",
  },
  recipeSection: {
    alignSelf: "stretch",
  },
  loadingCategoryContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  recipesRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  additionalContent: {
    marginTop: 30,
    width: "100%",
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  popularRecipesContainer: {
    width: "100%",
  },
  featuredImageContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
});
