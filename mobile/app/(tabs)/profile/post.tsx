import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "../../../components/RecipeCard";
import { API_URL } from "@/config";
import { useApi } from "@/hooks/useApi";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";

// Define types for recipe data
interface Post {
  recipe_id: number;
  title: string;
  image_url: string;
  average_rating: number;
  prep_time: string;
  cook_time: string;
  total_ratings: number;
}

const api_url_user_posts = API_URL + "/users/posts";

export default function PostsScreen() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const { userId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    console.log("userId in post", userId);
  }, [userId]);

  React.useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setIsLoading(true);
        console.log("api is", api_url_user_posts + "/" + userId);
        const response = await fetch(api_url_user_posts + "/" + userId);
        const data = await response?.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching liked recipes:", error);
        console.log("likely the authentication fails");

        // redirect to login page
        window.location.href = "/";
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserPosts();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["right", "bottom", "left"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Posts</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D98324" />
        </View>
      ) : (
        <>
          {/* Recipe Grid */}
          {posts.length > 0 ? (
            <FlatList
              data={posts}
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
          ) : (
            <View style={styles.noPostsContainer}>
              <Text>No posts yet, start creating your own recipes!</Text>
            </View>
          )}
        </>
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
  noPostsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
