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
  prepTime?: string;
  cookTime?: string;
  description?: string;
  isSmallCard?: boolean;
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
  isSmallCard = false,
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
          size={isSmallCard ? 9 : 14}
          color={i <= rating ? "#D98324" : "#D9D9D9"}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View
          style={[styles.imageContainer, { height: isSmallCard ? 110 : 200 }]}
        >
          <Image source={image} style={styles.image} resizeMode="cover" />
        </View>
        <View
          style={[styles.contentContainer, { padding: isSmallCard ? 5 : 16 }]}
        >
          <Text
            style={[
              styles.title,
              {
                fontSize: isSmallCard ? 11 : 32,
                marginBottom: isSmallCard ? 2 : 8,
              },
            ]}
          >
            {title}
          </Text>

          <View
            style={[
              styles.ratingContainer,
              { marginBottom: isSmallCard ? 2 : 8 },
            ]}
          >
            {!isSmallCard && <Text style={styles.ratingText}>{rating} </Text>}

            <View style={styles.starsContainer}>{renderStars()}</View>
            <Text
              style={[styles.ratingText, { fontSize: isSmallCard ? 9 : 16 }]}
            >
              ({totalRatings})
            </Text>
          </View>

          {isSmallCard ? (
            <View style={[styles.timeContainer, { marginBottom: 2 }]}>
              <Text style={[styles.timeText, { fontSize: 9 }]}>
                Total time: {totalTime}
              </Text>
            </View>
          ) : (
            <>
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
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    // outside, we set the border radius and shadow so that the shadow can work with overflow = "hidden"
  cardContainer: {
    width: "100%",
    height: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
    marginVertical: 8,
  },
  // inside, we set the overflow to "hidden".
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EFDCAB",
    position: "relative",
  },
  imageContainer: {
    backgroundColor: "#f0f0f0", // Placeholder color
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: "Lora-Regular",
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
