import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "@/components/RecipeCard";
import { useRouter } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Define types for recipe data
interface Recipe {
  id: string;
  title: string;
  image: any;
  rating: number;
  totalRatings: number;
  totalTime: string;
}

// Sample data for recently saved recipes
const recentlySavedRecipes: Recipe[] = [
  {
    id: "1",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.9,
    totalRatings: 12,
    totalTime: "30 minutes",
  },
  {
    id: "2",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.8,
    totalRatings: 15,
    totalTime: "30 minutes",
  },
  {
    id: "3",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.7,
    totalRatings: 10,
    totalTime: "30 minutes",
  },
  {
    id: "4",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.8,
    totalRatings: 9,
    totalTime: "30 minutes",
  },
  {
    id: "5",
    title: "Coconut Fish and Tomato Bake",
    image: require("@/assets/images/pasta.png"),
    rating: 4.9,
    totalRatings: 11,
    totalTime: "30 minutes",
  },
];

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
      <Text style={[styles.tabText]}>
        {title}
      </Text>
      <View style={{flex: 1}} />
      <MaterialIcons name="navigate-next" size={20} color="grey" />
    </View>
    <View style={styles.divider} />
  </TouchableOpacity>
);

export default function CollectionsScreen() {
  const [activeTab, setActiveTab] = React.useState("saved");
  const router = useRouter();

  // Navigate to subpages
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    router.push(`/(tabs)/collections/${tab}` as any);
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
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
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
          />
        </View>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: section_padding_horizontal,
    paddingTop: 8,
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
