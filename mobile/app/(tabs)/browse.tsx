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
import { LinearGradient } from "expo-linear-gradient";

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Header with greeting and search */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{`Good Morning,\nLuke Cao`}</Text>
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
        <View style={styles.recipeSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.recipesRow}>
              {recipeData.map((recipe) => (
                <View
                  key={recipe.id}
                  style={{ width: 170, height: 170, marginRight: 10 }}
                >
                  <RecipeCard
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
        </View>

        {/* Additional Content for Testing Vertical Scroll */}
        <View style={styles.additionalContent}>
          <Text style={styles.sectionTitle}>Extra Things TODO</Text>
          <View style={styles.popularRecipesContainer}>
            {recipeData.map((recipe) => (
              <View
                key={`popular-${recipe.id}`}
                style={{ width: "100%", height: 200, marginBottom: 20 }}
              >
                <RecipeCard
                  title={recipe.title}
                  image={recipe.image}
                  rating={recipe.rating}
                  totalTime={recipe.totalTime}
                  totalRatings={recipe.totalRatings}
                  isSmallCard={false}
                />
              </View>
            ))}
          </View>
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
  scrollViewContent: {
    alignItems: "center",
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
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
  featuredContainer: {
    marginTop: 20,
    width: 350,
    height: 350,
    position: "relative",
    overflow: "hidden",
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
});
