import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "@/components/RecipeCard";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useApi } from "@/hooks/useApi";
import { API_URL } from "@/config";
import { Animated } from "react-native";

// Define types for recipe data
interface Recipe {
  recipe_id: number;
  title: string;
  image_url: any;
  average_rating: number;
  total_ratings: number;
  prep_time: string;
  cook_time: string;
}

// Search result type
interface SearchRecipe {
  recipe_id: number;
  title: string;
  image_url: string;
}

// Define types for the collection tab props
interface CollectionTabProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  isActive?: boolean;
  onPress: () => void;
}

// Collection Tab item component
const CollectionTab: React.FC<CollectionTabProps> = ({
  icon,
  title,
  isActive = false,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.collectionTab]}>
      <Ionicons
        name={icon}
        size={28}
        color={"#D98324"}
        style={styles.tabIcon}
      />
      <Text style={[styles.tabText]}>{title}</Text>
      <View style={{ flex: 1 }} />
      <MaterialIcons name="navigate-next" size={20} color="grey" />
    </View>
    <View style={styles.divider} />
  </TouchableOpacity>
);

const api_url_collections = API_URL + "/collections";

export default function CollectionsScreen() {
  const [activeTab, setActiveTab] = React.useState("saved");
  const [recentlySavedRecipes, setRecentlySavedRecipes] = React.useState<
    Recipe[]
  >([]);
  const router = useRouter();
  const { apiCall } = useApi();

  // Search-related state
  const [isSearchMode, setIsSearchMode] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchRecipe[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const searchAnimation = React.useRef(new Animated.Value(0)).current;
  const timer = React.useRef<NodeJS.Timeout | null>(null);

  // Navigate to subpages
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    router.push(`/(tabs)/collections/${tab}` as any);
  };

  React.useEffect(() => {
    const fetchRecentlySavedRecipes = async () => {
      const response = await apiCall(`${api_url_collections}/recent`);
      const data = await response?.json();
      setRecentlySavedRecipes(data);
    };
    fetchRecentlySavedRecipes();
  }, []);

  // Search functionality
  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiCall(
        `${api_url_collections}/search?query=${encodeURIComponent(query)}`
      );
      const data = await response?.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setSearchResults([]);
      setIsSearching(false);
      window.location.href = "/";
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  React.useEffect(() => {
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
  React.useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSearchMode]);

  const toggleSearchMode = () => {
    if (isSearchMode) {
      setSearchQuery("");
      setSearchResults([]);
    }
    setIsSearchMode(!isSearchMode);
  };

  // Render two columns of recipe cards
  const renderRecipeItem = ({
    item,
    index,
  }: {
    item: Recipe;
    index: number;
  }) => (
    <View style={styles.recipeCardContainer}>
      <RecipeCard
        recipe_id={item.recipe_id.toString()}
        image={item.image_url}
        title={item.title}
        rating={item.average_rating}
        prepTime={item.prep_time}
        cookTime={item.cook_time}
        totalRatings={item.total_ratings}
        isSmallCard={true}
        isActiveCard={true}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!isSearchMode ? (
          <>
            <Text style={styles.title}>Collections</Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={toggleSearchMode}
            >
              <Ionicons name="search-outline" size={24} color="#333" />
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

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
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
                    />
                    <View style={styles.searchResultTextContainer}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>
                        {recipe.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : searchQuery.length > 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No recipes found for "{searchQuery}"
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <>
            {/* Collection Tabs */}
            <View style={styles.collectionTabs}>
              <CollectionTab
                icon="heart-outline"
                title="Likes"
                isActive={activeTab === "likes"}
                onPress={() => navigateToTab("likes")}
              />
              <CollectionTab
                icon="bookmark-outline"
                title="Saved"
                isActive={activeTab === "saved"}
                onPress={() => navigateToTab("saved")}
              />
              {/* <CollectionTab
                icon="albums-outline"
                title="Created Collections"
                isActive={activeTab === "created"}
                onPress={() => setActiveTab("created")}
              /> */}
            </View>

            {/* Recently Saved Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recently Saved</Text>
              <FlatList
                data={recentlySavedRecipes}
                renderItem={renderRecipeItem}
                keyExtractor={(item) => item.recipe_id.toString()}
                numColumns={2}
                scrollEnabled={false}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Tab Navigation will be handled by the app's navigation system */}
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
    paddingTop: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: section_padding_horizontal,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D98324",
    fontFamily: "Lora-Bold",
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
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
  collectionTabs: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  collectionTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  activeCollectionTab: {
    backgroundColor: "#FFF9E9",
  },
  tabIcon: {
    marginRight: 12,
  },
  tabText: {
    fontSize: 20,
    color: "#",
    fontFamily: "Lora-Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  activeTabText: {
    fontWeight: "600",
    color: "#D98324",
    fontFamily: "Lora-Regular",
  },
  sectionContainer: {
    paddingHorizontal: section_padding_horizontal,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 16,
    color: "#D98324",
    fontFamily: "Lora-Bold",
  },
  recipeCardContainer: {
    width: cardWidth,
    height: cardWidth,
    marginBottom: 16,
    marginRight: card_padding_horizontal,
  },
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: section_padding_horizontal,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 16,
    color: "#D98324",
    fontFamily: "Lora-Bold",
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Lora-Regular",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});
