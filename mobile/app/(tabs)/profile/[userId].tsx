import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../../hooks/useAuth";
import { useApi } from "../../../hooks/useApi";
import { API_URL } from "@/config";
import { StatusBar } from "expo-status-bar";
import RecipeCard from "@/components/RecipeCard";
import * as ImagePicker from "expo-image-picker";

//   console.log("Hes")

// Format 1000 numbers to K
function formatNumber(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

type SmallRecipe = {
  recipe_id: number;
  title: string;
  image_url: string;
  average_rating: number;
  prep_time: string;
  cook_time: string;
  total_ratings: number;
};

// Define interfaces for user data
interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  bio?: string;
  profile_image?: string;
  followers_count: number;
  following_count: number;
  like_count: number;
  save_count: number;
  posts: SmallRecipe[];

  is_following?: boolean;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { userID, logout } = useAuth();
  const { apiCall } = useApi();
  const isFocused = useIsFocused();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
  //   {}
  // );
  const [settingsVisible, setSettingsVisible] = useState(false);

  //const [groceryList, setGroceryList] = useState<string[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Determine if this is the current user's profile
  const isCurrentUser = userID == userId;

  console.log(isCurrentUser);

  // const handleCheckboxToggle = (item: string) => {
  //   setCheckedItems((prev) => ({
  //     ...prev,
  //     [item]: !prev[item],
  //   }));
  // };

  // Fetch user data
  useEffect(() => {
    console.log("userId", userId);
    console.log("current user id", userID);
    console.log("isFocused", isFocused);
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiCall(`${API_URL}/users/${userId}`);

        console.log(response);

        if (!response) {
          setError("Unable to fetch profile data");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.detail || "Error fetching profile");
          return;
        }

        const data = await response.json();

        if (data?.is_following) {
          setIsFollowing(true);
        }

        setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("An error occurred while fetching profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && isFocused) {
      fetchUserProfile();
    }
  }, [userId, isFocused]);

  const handleChangeProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const imageAsset = result.assets[0];

      // Get presigned URL
      const presignedResponse = await apiCall(`${API_URL}/users/generate-presigned-url-profile`);
      const { upload_url, image_url } = await presignedResponse.json();

      // Upload to AWS S3
      const imageUpload = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: await fetch(imageAsset.uri).then(res => res.blob()),
      });

      if (!imageUpload.ok) {
        console.error("Failed to upload image to S3");
        return;
      }

      // backend update the profile image url
      const updateProfileImageResponse = await apiCall(`${API_URL}/users/me/profile-image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url }),
      });

      if (!updateProfileImageResponse.ok) {
        console.error("Failed to update profile image URL");
        return;
      }

      // update local user state immediately
      setUser((prev) => prev ? { ...prev, profile_image: image_url } : prev);
    } catch (error) {
      console.error("Error changing profile picture:", error);
    }
  };

  const handleFollowAction = async () => {
    if (followLoading) return;

    try {
      setFollowLoading(true);

      let action = isFollowing ? "unfollow" : "follow";

      const response = await apiCall(`${API_URL}/users/${action}/${userId}`, {
        method: "POST",
      });

      if (response && response.ok) {
        // update the UI to show following state
        setIsFollowing((prev) => !prev);

        // refresh user data to get updated follower count from backend
        //setIsLoading(true); // This will trigger fetchUserProfile in the useEffect
      } else {
        const errorData = await response.json();
        console.error("Error following user:", errorData);
      }
    } catch (error) {
      console.error("Error in follow action:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // These conditional returns should be after all hook declarations
  // to avoid React hook rules violations
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D98324" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  // Handle logout
  const handleLogout = () => {
    setSettingsVisible(false);
    try {
      logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>{user.username}</Text>
          {isCurrentUser ? (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setSettingsVisible(true)}
            >
              <Ionicons name="settings-outline" size={24} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>

        {/* Settings Popup Modal */}
        <Modal
          visible={settingsVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSettingsVisible(false)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={22} color="#E53935" />
                <Text style={[styles.modalOptionText, styles.logoutText]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Profile */}
        <View style={styles.profileInfo}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={
                user.profile_image
                  ? { uri: user.profile_image }
                  : require("@/assets/images/default-profile.jpg")
              }
              style={styles.profilePicture}
            />

            {isCurrentUser && (
              <TouchableOpacity style={styles.editIcon} onPress={handleChangeProfilePicture}>
                <Ionicons name="pencil" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {isCurrentUser && (
            <View style={styles.statsContainer}>
              {/* followers and likes */}
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.stat}
                  onPress={() => router.push(`/(tabs)/profile/followed`)}
                >
                  <Text style={styles.statNumber}>
                    {formatNumber(user.followers_count)}
                  </Text>
                  <Text style={styles.statLabel}>followers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/(tabs)/collections`)}
                  style={styles.stat}
                >
                  <Text style={styles.statNumber}>
                    {formatNumber(user.like_count || 0)}
                  </Text>
                  <Text style={styles.statLabel}>likes</Text>
                </TouchableOpacity>
              </View>

              {/* following and saves */}
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.stat}
                  onPress={() => router.push(`/(tabs)/profile/following`)}
                >
                  <Text style={styles.statNumber}>
                    {formatNumber(user.following_count)}
                  </Text>
                  <Text style={styles.statLabel}>following</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stat}
                  onPress={() => router.push(`/(tabs)/collections`)}
                >
                  <Text style={styles.statNumber}>
                    {formatNumber(user.save_count || 0)}
                  </Text>
                  <Text style={styles.statLabel}>saves</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Bio */}
        {user.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        )}

        {/* Posts */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionTitleContainer}
            onPress={() =>
              router.push({
                pathname: `/(tabs)/profile/post`,
                params: { userId: userId },
              })
            }
          //   onPress={() => router.push(`/users/${userId}/posts`)}
          >
            <Text style={styles.sectionTitle}>Posts</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#D98324"
              style={styles.icon}
            />
          </TouchableOpacity>
          <View style={styles.recipeSection}>
            {user.posts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.recipesRow}>
                  {user.posts.map((recipe) => (
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
            ) : (
              <View style={styles.noPostsContainer}>
                <Text>No posts yet, start creating your own recipes!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Grocery List (only show if it's the current user) */}
        {isCurrentUser && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionTitleContainer}
              onPress={() => router.push("/(tabs)/profile/grocery-list")}
            >
              <Text style={styles.sectionTitle}>Grocery List</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#D98324"
                style={styles.icon}
              />
            </TouchableOpacity>
            {/* <ScrollView
              style={[styles.groceryListContainer, { maxHeight: 5 * 27 }]}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              indicatorStyle="black"
            >
              {groceryList.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.groceryItem}
                  onPress={() => handleCheckboxToggle(item)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checkedItems[item] && styles.checkboxChecked,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        checkedItems[item] && styles.checkboxChecked,
                      ]}
                    >
                      {checkedItems[item] && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.groceryText}>{item}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView> */}
          </View>
        )}

        {/* Follow/Unfollow Button (if not current user) */}
        {!isCurrentUser && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
                followLoading && styles.disabledButton,
              ]}
              onPress={handleFollowAction}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.followButtonText}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  backButton: {
    padding: 8,
  },
  username: {
    fontFamily: "Lora-Bold",
    fontSize: 24,
    color: "#D98324",
  },
  settingsButton: {
    paddingRight: 20,
  },
  profileInfo: {
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
  },
  profilePicture: {
    width: 113,
    height: 113,
    marginRight: 16,
    borderRadius: 56.5, // Makes it circular
  },
  statsContainer: {
    paddingHorizontal: 30,
    marginRight: 20,
    marginTop: 20,
    paddingRight: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  stat: {
    width: "40%",
    justifyContent: "center",
    paddingRight: 20,
    alignItems: "center",
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: "Lora-Bold",
  },
  statLabel: {
    color: "#D98324",
    fontSize: 16,
    fontFamily: "Lora-Bold",
    textAlign: "center",
  },
  bioContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#D3D3D3",
    marginHorizontal: 15,
  },
  bio: {
    fontFamily: "Lora-Regular",
    fontSize: 20,
    padding: 5,
    textAlign: "center",
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: "Lora-Bold",
    fontSize: 20,
    color: "#D98324",
  },
  recipeSection: {
    alignSelf: "stretch",
    minHeight: 180,
    marginTop: 10,
  },
  recipesRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  icon: {
    marginLeft: 8,
  },
  groceryListContainer: {
    marginTop: 10,
  },
  groceryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#D98324",
    borderColor: "#D98324",
  },
  groceryText: {
    fontSize: 16,
    fontFamily: "Lora-Regular",
  },
  actionContainer: {
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  followButton: {
    backgroundColor: "#D98324",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  followButtonText: {
    color: "white",
    fontFamily: "Lora-Bold",
    fontSize: 16,
  },
  followingButton: {
    backgroundColor: "#555", // Different color for following state
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 180,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: "Lora-Regular",
    color: "#333",
  },
  logoutText: {
    color: "#E53935",
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePictureContainer: {
    position: "relative",
  },
  editIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#D98324",
    borderRadius: 14,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
