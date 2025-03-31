import RecipeCard from "@/components/RecipeCard";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Image,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";

export default function IndexScreen() {
  const spicyTomatoImage = require("@/assets/images/spicy-tomato.jpg");

  useEffect(() => {
    console.log("Image source:", spicyTomatoImage);
    console.log("Platform:", Platform.OS);
  }, []);

  const handlePress = () => {
    Alert.alert(
      "Recipe Selected",
      "You selected the Coconut Fish and Tomato Bake recipe"
    );
  };

  const handleShare = () => {
    Alert.alert("Share", "Sharing this delicious recipe!");
  };

  const handleIgnore = () => {
    Alert.alert("Ignored", "Recipe has been ignored");
  };

  const handleLike = () => {
    Alert.alert("Liked", "Recipe has been added to your favorites");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Social Cooking</Text>
      <View style={{ height: "75%", width: "90%", marginVertical: 10 }}>
        <RecipeCard
          image={spicyTomatoImage}
          title="Coconut Fish and Tomato Bake"
          rating={4}
          totalRatings={10184}
          totalTime="30 minutes"
          prepTime="10 minutes"
          cookTime="20 minutes"
          description="A coconut-milk dressing infused with garlic, ginger, turmeric and lime coats fish fillets in this sheet-pan dinner. Accompanying the fish are bright bursts of tomatoes which turn jammy"
          onPress={handlePress}
          onShare={handleShare}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.ignoreButton} onPress={handleIgnore}>
          <Text style={styles.ignoreButtonText}>Ignore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.likeButtonText}>Like</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F5E9",
  },
  title: {
    fontFamily: "Lora-Bold",
    fontSize: 24,
    fontWeight: "bold",
    color: "#D98324",
    marginTop: 20,
    alignSelf: "flex-start",
    marginLeft: 25,
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
  ignoreButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#EFDCAB",
  },
  likeButton: {
    backgroundColor: "#EFDCAB",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  ignoreButtonText: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "500",
  },
  likeButtonText: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "500",
  },
});
