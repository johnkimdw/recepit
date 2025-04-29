import React from "react";
import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "../../../components/RecipeCard";
import { API_URL } from "@/config";
import { useApi } from "@/hooks/useApi";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

// Define types for recipe data
interface Follow {
  user_id: number;
  username: string;
  profilePicture?: any; // need to be handled based on how we store images
}

const api_url_user_following = API_URL + "/users/following";

const UserRow = ({ user }: { user: Follow }) => {
  return (
    <TouchableOpacity style={styles.userRow} onPress={() => router.push(`/(tabs)/profile/${user.user_id}`)}>
      <Text>{user.username}</Text>
    </TouchableOpacity>
  );
};

export default function FollowingScreen() {
  const [following, setFollowing] = React.useState<Follow[]>([]);
  const { apiCall } = useApi();
  const { userID } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setIsLoading(true);
        const response = await apiCall(api_url_user_following + "/" + userID);
        const data = await response?.json();
        setFollowing(data);
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
  }, [userID]);

  return (
    <SafeAreaView style={styles.container} edges={["right", "bottom", "left"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Following</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D98324" />
        </View>
      ) : (
        following.length > 0 ? (
          <FlatList
            data={following}
            renderItem={({ item }) => <UserRow user={item} />}
            keyExtractor={(item) => item.user_id.toString()}
            contentContainerStyle={styles.listContent}
      />
    ) : (
      <View style={styles.noPostsContainer}>
        <Text>No following users</Text>
          </View>
        )
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
  userRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
