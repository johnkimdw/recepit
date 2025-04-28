import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  Share,
  Linking,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  ImageSourcePropType,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import GroceryItem from "./GroceryItem";
import GroceryRecipeCard from "./GroceryRecipe";
import { useApi } from "../hooks/useApi";
import { API_URL } from "@/config";

// Define types
interface GroceryItemType {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
}

// Define IngredientItem
interface IngredientItem {
  id: string;
  name: string;
}

interface Ingredient {
  name: string;
  quantity: number;
}

interface GroceryRecipe {
  recipe_id: string;
  title: string;
  ingredients: Ingredient[];
  image_url: ImageSourcePropType;
}

const api_url_recipes = API_URL + "/recipes";

const GroceryListScreen: React.FC = () => {
  // State management
  const [groceryItems, setGroceryItems] = useState<GroceryItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<IngredientItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const { apiCall } = useApi();
  // Add state to track expanded recipes
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(
    new Set()
  );

  const [currentSearchIngredient, setCurrentSearchIngredient] =
    useState<IngredientItem | null>(null);

  const [groceryRecipe, setGroceryRecipe] = useState<GroceryRecipe[]>([]);
  const [isLoadingGroceryRecipe, setIsLoadingGroceryRecipe] =
    useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (searchQuery.length > 0) {
      const item: IngredientItem = {
        id: searchQuery,
        name: searchQuery,
      };
      setCurrentSearchIngredient(item);
    } else {
      setCurrentSearchIngredient(null);
    }
  }, [searchQuery]);

  // Load saved grocery list on component mount
  useEffect(() => {
    loadGroceryList();
    loadGroceryRecipe();
  }, []);

  // Save grocery list when it changes
  useEffect(() => {
    saveGroceryList();
  }, [groceryItems]);

  // Debounced search
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    timer.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
  }, [searchQuery]);

  // Handle search with results
  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiCall(
        `${api_url_recipes}/search/ingredients?query=${encodeURIComponent(
          query
        )}`
      );
      const data = await response?.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    if (isSearchMode) {
      setSearchQuery("");
      setSearchResults([]);
    }
    setIsSearchMode(!isSearchMode);
  };

  // Load grocery list from AsyncStorage
  const loadGroceryList = async (): Promise<void> => {
    try {
      const jsonValue = await AsyncStorage.getItem("@grocery_list");
      if (jsonValue != null) {
        setGroceryItems(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error("Error loading grocery list:", error);
    }
  };

  // Save grocery list to AsyncStorage
  const saveGroceryList = async (): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(groceryItems);
      await AsyncStorage.setItem("@grocery_list", jsonValue);
    } catch (error) {
      console.error("Error saving grocery list:", error);
    }
  };

  const loadGroceryRecipe = async (): Promise<void> => {
    try {
      setIsLoadingGroceryRecipe(true);
      const jsonValue = await AsyncStorage.getItem("@grocery_recipe_ids");
      if (jsonValue != null) {
        const groceryRecipeIds = JSON.parse(jsonValue);

        if (groceryRecipeIds && groceryRecipeIds.length > 0) {
          // Build a URL with the correct FastAPI List[str] format (repeated parameters)
          const params = new URLSearchParams();

          // Add each recipe ID as a separate parameter with the same name
          groceryRecipeIds.forEach((recipeId: string) => {
            params.append("recipe_ids", recipeId);
          });

          const url = `${api_url_recipes}/?${params.toString()}`;

          const response = await apiCall(url);
          const data = await response?.json();
          setGroceryRecipe(data);
        } else {
          setGroceryRecipe([]);
        }
      }
    } catch (error) {
      console.error("Error loading grocery recipe:", error);
      setGroceryRecipe([]);
    } finally {
      setIsLoadingGroceryRecipe(false);
    }
  };

  // Add a new item to the grocery list
  const addItem = (item: IngredientItem | null): void => {
    if (item === null) {
      return;
    }
    // Check if item already exists
    const existingItemIndex = groceryItems.findIndex(
      (existing) => existing.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      updateItemQuantity(existingItemIndex, 1);
      setSearchQuery("");
      setIsSearchMode(false);
    } else {
      // Add new item
      const newItem: GroceryItemType = {
        id: item.id || Date.now().toString(),
        name: item.name,
        quantity: 1,
        checked: false,
      };
      setGroceryItems((prevItems) => [...prevItems, newItem]);
      setSearchQuery("");
      setIsSearchMode(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = (index: number, change: number): void => {
    setGroceryItems((prevItems) => {
      return prevItems
        .map((item, i) => {
          if (i === index) {
            const newQuantity = Math.max(0, item.quantity + change);
            // If quantity becomes 0, remove item in a separate step
            if (newQuantity === 0) {
              return null;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as GroceryItemType[]; // Remove null items (when quantity becomes 0)
    });
  };

  // Delete an item
  const deleteItem = (index: number): void => {
    setGroceryItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Export to Notes app
  const exportToNotes = async (): Promise<void> => {
    try {
      let formattedList = groceryItems
        .map((item) => `☐ ${item.quantity}x ${item.name}`)
        .join("\n");

      for (const recipe of groceryRecipe) {
        formattedList += `\n${recipe.title}\n`;
        for (const ingredient of recipe.ingredients) {
          formattedList += `☐ ${ingredient.quantity.toString().length > 0 ? ingredient.quantity : 1} x ${ingredient.name}\n`;
        }
      }

      await Share.share({
        title: "Grocery List",
        message: formattedList,
      });
    } catch (error) {
      console.error("Error exporting list:", error);
      Alert.alert("Export Failed", "Could not export your grocery list.");
    }
  };

  // Checkout to Instacart
  const checkoutToInstacart = (): void => {
    // Add deep linking or URL scheme for Instacart
    const instacartUrl = "https://www.instacart.com";
    Linking.openURL(instacartUrl).catch((err) => {
      Alert.alert(
        "Error",
        "Could not open Instacart. Please install the app or visit their website."
      );
    });
  };

  // Toggle recipe expansion
  const toggleRecipeExpansion = (recipeId: string) => {
    setExpandedRecipes((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(recipeId)) {
        newExpanded.delete(recipeId);
      } else {
        newExpanded.add(recipeId);
      }
      return newExpanded;
    });
  };

  const toggleRecipeDeletion = async (recipeId: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem("@grocery_recipe_ids");
      if (jsonValue != null) {
        const groceryRecipeIds = JSON.parse(jsonValue);
        const updatedGroceryRecipeIds = groceryRecipeIds.filter(
          (id: string) => id !== recipeId.toString()
        );
        await AsyncStorage.setItem(
          "@grocery_recipe_ids",
          JSON.stringify(updatedGroceryRecipeIds)
        );
      }
      setGroceryRecipe((prevRecipe) =>
        prevRecipe.filter((recipe) => recipe.recipe_id !== recipeId)
      );
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  // Render grocery item
  const renderGroceryItem = ({
    item,
    index,
  }: {
    item: GroceryItemType;
    index: number;
  }) => (
    <GroceryItem
      item={item}
      onUpdateQuantity={(change: number) => updateItemQuantity(index, change)}
      onDelete={() => deleteItem(index)}
    />
  );

  const renderGroceryRecipe = ({
    item,
    index,
  }: {
    item: GroceryRecipe;
    index: number;
  }) => {
    return (
      <GroceryRecipeCard
        item={item}
        expandedRecipes={expandedRecipes}
        toggleRecipeExpansion={toggleRecipeExpansion}
        toggleRecipeDeletion={toggleRecipeDeletion}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Grocery List</Text>
        </View>

        {/* Search Bar - Similar to likes.tsx */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={toggleSearchMode}
        >
          <Ionicons
            name="search"
            size={20}
            color="#888"
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

        {/* Show either search results or grocery list */}
        {isSearchMode ? (
          <View style={styles.searchResultsContainer}>
            {currentSearchIngredient && (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => addItem(currentSearchIngredient)}
              >
                <View style={styles.searchResultTextContainer}>
                  <Text style={styles.searchResultTitle}>
                    {currentSearchIngredient?.name}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#D98324" />
              </TouchableOpacity>
            )}

            {isSearching ? (
              <ActivityIndicator
                size="large"
                color="#D98324"
                style={styles.searchingIndicator}
              />
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => addItem(item)}
                  >
                    <View style={styles.searchResultTextContainer}>
                      <Text style={styles.searchResultTitle}>{item.name}</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color="#D98324" />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) =>
                  item.id || `suggestion-${Date.now()}-${Math.random()}`
                }
                style={styles.searchResultsList}
              />
            ) : searchQuery.trim() !== "" ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No items found. Tap the + button to add "{searchQuery}"
                </Text>
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={() =>
                    addItem({ id: `new-${Date.now()}`, name: searchQuery })
                  }
                >
                  <Text style={styles.addNewButtonText}>Add Item</Text>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : (
          /* Grocery Items List */
          <View style={styles.groceryListContainer}>
            {groceryItems.length > 0 ? (
              <FlatList
                data={groceryItems}
                renderItem={renderGroceryItem}
                keyExtractor={(item) => item.id}
                style={styles.groceryList}
              />
            ) : (
              <Text style={styles.emptyText}>
                Your grocery search list is empty. Start by searching for items
                to add.
              </Text>
            )}
            {isLoadingGroceryRecipe ? (
              <ActivityIndicator
                size="large"
                color="#D98324"
                style={styles.searchingIndicator}
              />
            ) : (
              <FlatList
                data={groceryRecipe}
                renderItem={renderGroceryRecipe}
                keyExtractor={(item) => item.recipe_id}
                style={styles.groceryList}
              />
            )}
          </View>
        )}

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <Pressable
            style={[styles.button, styles.exportButton]}
            onPress={exportToNotes}
          >
            <Text style={styles.buttonText}>Export</Text>
            <Ionicons name="share-outline" size={20} color="#D98324" />
          </Pressable>

          <Pressable
            style={[styles.button, styles.checkoutButton]}
            onPress={checkoutToInstacart}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
            <Ionicons name="cart-outline" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f5eb",
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 80 : 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Lora-Bold",
    color: "#D98324",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEBE4",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#D98324",
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultsContainer: {
    flex: 1,
    marginTop: 10,
  },
  searchingIndicator: {
    marginTop: 30,
  },
  searchResultsList: {
    width: "100%",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  noResultsContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 15,
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D98324",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  addNewButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginRight: 8,
  },
  groceryList: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 40,
    color: "#888",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  exportButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D98324",
    flex: 1,
    marginRight: 10,
  },
  checkoutButton: {
    backgroundColor: "#D98324",
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#D98324",
    marginRight: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginRight: 8,
  },
  groceryListContainer: {
    flex: 1,
  },
});

export default GroceryListScreen;
