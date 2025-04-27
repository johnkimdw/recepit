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
import { useAuth } from "../../../hooks/useAuth";
import { useApi } from "../../../hooks/useApi";
import { API_URL } from "@/config";
import { StatusBar } from "expo-status-bar";

//   console.log("Hes")

// Format 1000 numbers to K
function formatNumber(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

// Define interfaces for user data
interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  bio?: string;
  profilePicture?: any; // need to be handled based on how we store images
  followers_count: number;
  following_count: number;
  likes_count: number;
  saves_count: number;
  grocery_list?: string[];
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { userID, logout } = useAuth();
  const { apiCall } = useApi();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Determine if this is the current user's profile
  const isCurrentUser = userID == userId;

  console.log(isCurrentUser);

  const handleCheckboxToggle = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // Fetch user data
  useEffect(() => {
    console.log(userId);
    console.log(userID);
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiCall(`${API_URL}/users/${userId}`);
        //   const response = await fetch(`${API_URL}/users/${userID}`);
        // const data = await response.json();
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
        setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("An error occurred while fetching profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading && userId) {
      fetchUserProfile();
    }
  }, [userId, apiCall]);

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  // Handle logout
  const handleLogout = () => {
    setSettingsVisible(false);
    try {
      logout();
      window.location.href = '/'
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
          <Image
            source={
              user.profilePicture ||
              require("@/assets/images/default-profile.jpg")
            }
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            {/* followers and likes */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {formatNumber(user.followers_count)}
                </Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {formatNumber(user.likes_count || 0)}
                </Text>
                <Text style={styles.statLabel}>likes</Text>
              </View>
            </View>

            {/* following and saves */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {formatNumber(user.following_count)}
                </Text>
                <Text style={styles.statLabel}>following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {formatNumber(user.saves_count || 0)}
                </Text>
                <Text style={styles.statLabel}>saves</Text>
              </View>
            </View>
          </View>
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
            onPress={() => router.push(`/`)}
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
        </View>

        {/* Grocery List (only show if it's the current user) */}
        {isCurrentUser && user.grocery_list && user.grocery_list.length > 0 && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionTitleContainer}
              onPress={() => router.push("/grocery-list")}
            >
              <Text style={styles.sectionTitle}>Grocery List</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#D98324"
                style={styles.icon}
              />
            </TouchableOpacity>
            <ScrollView
              style={[styles.groceryListContainer, { maxHeight: 5 * 27 }]}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              indicatorStyle="black"
            >
              {user.grocery_list.map((item) => (
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
                    {checkedItems[item] && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.groceryText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Follow/Unfollow Button (if not current user) */}
        {!isCurrentUser && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => console.log("Follow/Unfollow action")}
            >
              <Text style={styles.followButtonText}>Follow</Text>
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
});
