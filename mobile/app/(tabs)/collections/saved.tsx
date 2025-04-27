import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../../components/RecipeCard";
import { API_URL } from "@/config";
import { useApi } from "@/hooks/useApi";
import { router } from "expo-router";

// Define types for recipe data
interface Recipe {
  recipe_id: number;
  title: string;
  image_url: string;
  average_rating: number;
  prep_time: string;
  cook_time: string;
  total_ratings: number;
}

type SmallRecipe = {
  recipe_id: number;
  title: string;
  image_url: string;
};

const api_url_collections = API_URL + "/collections";
export default function LikesScreen() {
  // Search-related state
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SmallRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const { apiCall } = useApi();

  const [savedRecipes, setSavedRecipes] = React.useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setIsLoading(true);
        const response = await apiCall(api_url_collections + "/saves");
        const data = await response?.json();
        setSavedRecipes(data);
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
        console.log("likely the authentication fails");
        router.navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSavedRecipes();
  }, []);

  const toggleSearchMode = () => {
    if (isSearchMode) {
      setSearchQuery("");
      setSearchResults([]);
    }
    setIsSearchMode(!isSearchMode);
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiCall(
        `${api_url_collections}/search/saves?query=${encodeURIComponent(query)}`
      );
      const data = await response?.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setSearchResults([]);
      setIsSearching(false);
      router.navigate("/");
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

  return (
    <SafeAreaView style={styles.container} edges={["right", "bottom", "left"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
      </View>

      {/* Search Bar */}
        <TouchableOpacity
          onPress={toggleSearchMode}
          style={styles.searchContainer}
      >
        <Ionicons
          name="search"
          size={18}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </TouchableOpacity>

      {/* Recipe Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D98324" />
        </View>
      ) : isSearchMode ? (
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
        <FlatList
          data={savedRecipes}
          renderItem={({ item }) => (
            <View style={styles.recipeCardContainer}>
              <RecipeCard
                recipe_id={item.recipe_id.toString()}
                image={item.image_url}
                title={item.title}
                rating={item.average_rating}
                totalRatings={item.total_ratings}
                prepTime={item.prep_time}
                cookTime={item.cook_time}
                isSmallCard={true}
                isActiveCard={true}
              />
            </View>
          )}
          keyExtractor={(item) => item.recipe_id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const section_padding_horizontal = 16;
const card_padding_horizontal = 10;
const cardWidth =
  (width - section_padding_horizontal * 2 - card_padding_horizontal) / 2; // 2 columns with padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: section_padding_horizontal,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D98324",
    fontFamily: "Lora-Bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEBE4",
    borderRadius: 8,
    marginHorizontal: section_padding_horizontal,
    marginBottom: 16,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: section_padding_horizontal,
    paddingBottom: 80,
  },
  recipeCardContainer: {
    width: cardWidth,
    height: cardWidth,
    marginBottom: 16,
    marginRight: card_padding_horizontal,
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
});
