import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../../components/RecipeCard";

// Define types for recipe data
interface Recipe {
  id: string;
  title: string;
  image: any;
  rating: number;
  totalRatings: number;
  totalTime: string;
}

// Sample data for liked recipes
const likedRecipes: Recipe[] = [
  {
    id: "1",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.5,
    totalRatings: 136,
    totalTime: "30 minutes",
  },
  {
    id: "2",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.5,
    totalRatings: 134,
    totalTime: "30 minutes",
  },
  {
    id: "3",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.5,
    totalRatings: 130,
    totalTime: "30 minutes",
  },
  {
    id: "4",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.5,
    totalRatings: 134,
    totalTime: "30 minutes",
  },
  {
    id: "5",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.5,
    totalRatings: 146,
    totalTime: "30 minutes",
  },
  {
    id: "6",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.5,
    totalRatings: 134,
    totalTime: "30 minutes",
  },
];

export default function LikesScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <SafeAreaView style={styles.container} edges={["right", "bottom", "left"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Likes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
      </View>

      {/* Recipe Grid */}
      <FlatList
        data={likedRecipes}
        renderItem={({ item }) => (
          <View style={styles.recipeCardContainer}>
            <RecipeCard
              image={item.image}
              title={item.title}
              rating={item.rating}
              totalRatings={item.totalRatings}
              totalTime={item.totalTime}
              isSmallCard={true}
              isActiveCard={false}
              onPress={() => console.log(`Recipe ${item.id} pressed`)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
});
