import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecipeCardProps {
  image: any; // This can be a require() result or a URI object
  title: string;
  rating: number;
  totalRatings: number;
  totalTime: string;
  prepTime: string;
  cookTime: string;
  description: string;
  onPress?: () => void;
  onShare?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  image,
  title,
  rating,
  totalRatings,
  totalTime,
  prepTime,
  cookTime,
  description,
  onPress,
  onShare,
}) => {
  // Generate an array of 5 stars
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name="star"
          size={14}
          color={i <= rating ? "#D98324" : "#D9D9D9"}
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating} {" "}</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
          <Text style={styles.ratingText}>({totalRatings})</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>Total time: {totalTime}</Text>
          <Text style={styles.detailtimeText}>Prep time: {prepTime}</Text>
          <Text style={styles.detailtimeText}>Cook time: {cookTime}</Text>
        </View>

        <Text numberOfLines={6} style={styles.description}>
          {description}
        </Text>

        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "90%",
    height: "75%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EFDCAB",
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  imageContainer: {
    height: 200,
    backgroundColor: "#f0f0f0", // Placeholder color
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontFamily: "Lora-Regular",
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 4,
  },
  ratingText: {
    fontFamily: "Lora-Regular",
    fontSize: 16,
    color: "#666",
  },
  timeContainer: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  detailtimeText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 20,
    color: "#444",
    marginBottom: 8,
  },
  shareButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RecipeCard;
