import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
export default function BrowseScreen() {
  const [activeCategory, setActiveCategory] = useState("New & For you");

  const categories = [
    "New & For you",
    "Dessert",
    "Brunch",
    "Dinner",
    "Appetizers",
  ];

  const recipeData = [
    {
      id: 1,
      title: "Coconut Fish and Tomato Bake",
      image: require("@/assets/images/spicy-tomato.jpg"),
      rating: 4.5,
      totalTime: "30 minutes",
      totalRatings: 184,
    },
    {
      id: 2,
      title: "Creamy Tomato Pasta",
      image: require("@/assets/images/pasta.png"),
      rating: 5,
      totalTime: "30 minutes",
      totalRatings: 184,
    },
    {
      id: 3,
      title: "Creamy Spicy Tomato Pasta",
      image: require("@/assets/images/pasta.png"),
      rating: 4.8,
      totalTime: "30 minutes",
      totalRatings: 120,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with greeting and search */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.username}>Luke Cao</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Featured Recipe */}
      <View style={styles.featuredContainer}>
        <Image
          source={require("@/assets/images/pasta.png")}
          style={styles.featuredImage}
        />
        <View style={styles.featuredTextOverlay}>
          <Text style={styles.featuredText}>
            Creamy tomato pasta with a rich, spiced sauce
          </Text>
        </View>
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
                activeCategory === category && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.activeCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recipe Grid */}
      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        style={styles.recipeGrid}
      >
        <View style={styles.recipesRow}>
          {recipeData.map((recipe) => (
            <View style={{ width: 170, height: 170 }}>
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                image={recipe.image}
                rating={recipe.rating}
                totalTime={recipe.totalTime}
                totalRatings={recipe.totalRatings}
                isSmallCard={true}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 20,
    color: "#D98324",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D98324",
  },
  searchButton: {
    padding: 10,
  },
  featuredContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredTextOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 15,
  },
  featuredText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  HorizontalScrollViewWrapper: {
    height: 70,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#F2F2F2",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  activeCategoryButton: {
    backgroundColor: "#D98324",
  },
  categoryText: {
    fontSize: 14,
    color: "#888",
  },
  activeCategoryText: {
    color: "white",
    fontWeight: "500",
  },
  recipeGrid: {
    marginTop: 5,
  },
  recipesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    gap: 10,
  },
  recipeCard: {
    width: "31%",
    backgroundColor: "#FCF6E6",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  recipeInfo: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    height: 32,
  },
  recipeDetails: {
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeRating: {
    fontSize: 10,
    color: "#888",
    marginLeft: 5,
  },
  recipeDuration: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
});
