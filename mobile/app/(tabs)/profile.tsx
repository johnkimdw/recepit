import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
// import RecipeCard from "@/components/RecipeCard";
import { useState } from "react";

// Format 1000 numbers to K
function formatNumber(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export default function ProfileScreen() {
  // Profile data (placeholder)
  const profileData = {
    username: "lukewarm3",
    profilePicture: require("@/assets/images/profile.png"),
    followers: 120,
    following: 3,
    likes: 4700,
    saves: 1400,
    bio: "a meal without rice is no meal at all",
    groceryList: ["Milk", "Eggs", "Bread", "Tomatoes", "Pasta", "Cheese", "Apples", "Bananas", "oranges"],
  }

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const handleCheckboxToggle = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };
  const shouldScrollGroceryList = profileData.groceryList.length > 5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>{profileData.username}</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Alert.alert("Settings", "Settings button clicked!")}
          >
            <Ionicons name="settings-outline" size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileInfo}>
          <Image
            source={profileData.profilePicture}
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            {/* followers and likes */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{formatNumber(profileData.followers)}</Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{formatNumber(profileData.likes)}</Text>
                <Text style={styles.statLabel}>likes</Text>
              </View>
            </View>

            {/* following and saves */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{formatNumber(profileData.following)}</Text>
                <Text style={styles.statLabel}>following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{formatNumber(profileData.saves)}</Text>
                <Text style={styles.statLabel}>saves</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.bio}>{profileData.bio}</Text>
        </View>

        {/* Posts  */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Posts</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#D98324"
              style={styles.icon}
            />
          </View>
        </View>

        {/* Grocery List  */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Grocery List</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#D98324"
              style={styles.icon}
            />
          </View>
          <ScrollView
            style={[
              styles.groceryListContainer,
              { maxHeight: 5 * 27 }
            ]}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            indicatorStyle="black"
          >
            {profileData.groceryList.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.groceryItem}
                onPress={() => handleCheckboxToggle(item)}
              >
                <View style={[styles.checkbox, checkedItems[item] && styles.checkboxChecked]}>
                  {checkedItems[item] && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.groceryText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
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
});