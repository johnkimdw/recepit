import React, { useRef } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from "expo-router";
interface RecipeCardProps {
  recipe_id: string;
  image: any; // This can be a require() result or a URI object
  title: string;
  rating: number;
  totalRatings: number;
  totalTime: string;
  prepTime?: string;
  cookTime?: string;
  description?: string;
  isSmallCard?: boolean;
  onLike?: () => void;
  onIgnore?: () => void;
  isActiveCard?: boolean; // New prop to identify the top card
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe_id,
  image,
  title,
  rating,
  totalRatings,
  totalTime,
  prepTime,
  cookTime,
  description,
  isSmallCard = false,
  onLike,
  onIgnore,
  isActiveCard = true, // Default to true for backward compatibility
}) => {
  // Animated values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

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

  // Create a pan gesture - only enabled for the top card
  const panGesture = Gesture.Pan()
    .enabled(isActiveCard)
    .onStart(() => {
      // Reset scaling for next card
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY / 3; // Reduce vertical movement
      rotation.value = (event.translationX / SCREEN_WIDTH) * 15; // Rotate +/- 15 degrees
    })
    .onEnd((event) => {
      // If card is swiped far enough, trigger like or ignore
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped right - LIKE
        translateX.value = withSpring(
          SCREEN_WIDTH * 1.5,
          // the animation settings make the spring animation faster so that the card can disappear more quickly
          {
            stiffness: 200,
            damping: 15,
            mass: 0.5,
            overshootClamping: true,
            restDisplacementThreshold: 0.1,
            restSpeedThreshold: 0.1,
          },
          () => {
            if (onLike) {
              runOnJS(onLike)();
            }
          }
        );
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swiped left - IGNORE
        translateX.value = withSpring(
          -SCREEN_WIDTH * 1.5,
          {
            stiffness: 200,
            damping: 15,
            mass: 0.5,
            overshootClamping: true,
            restDisplacementThreshold: 0.1,
            restSpeedThreshold: 0.1,
          },
          () => {
            if (onIgnore) {
              runOnJS(onIgnore)();
            }
          }
        );
      } else {
        // Not swiped far enough, return to center
        translateX.value = withSpring(0, {
          stiffness: 200,
          damping: 15,
          mass: 0.5,
        });
        translateY.value = withSpring(0, {
          stiffness: 200,
          damping: 15,
          mass: 0.5,
        });
        rotation.value = withSpring(0, {
          stiffness: 200,
          damping: 15,
          mass: 0.5,
        });
      }
    });

  // Animated styles for the card
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  // Animated style for like indicator
  const likeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]);

    return {
      opacity: isActiveCard ? opacity : 0, // Only show for top card
      transform: [{ scale: opacity }, { rotate: "-30deg" }],
    };
  });

  // Animated style for ignore indicator
  const ignoreIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1]
    );

    return {
      opacity: isActiveCard ? opacity : 0, // Only show for top card
      transform: [{ scale: opacity }, { rotate: "30deg" }],
    };
  });

  const onReadMore = () => {
    router.push(`/details/${recipe_id}`);
  };

  // Return the card component
  return (
    <View style={styles.cardContainer}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={onReadMore}
            activeOpacity={0.9}
            disabled={!isActiveCard || !isSmallCard} // Only allow pressing the top card or it is small card
          >
            <View
              style={[
                styles.imageContainer,
                { height: isSmallCard ? 110 : 200 },
              ]}
            >
              <Image source={image} style={styles.image} resizeMode="cover" />

              {/* Like Indicator */}
              <Animated.View
                style={[
                  styles.indicatorContainer,
                  styles.likeContainer,
                  likeIndicatorStyle,
                ]}
              >
                <Text style={styles.indicatorText}>LIKE</Text>
              </Animated.View>

              {/* Ignore Indicator */}
              <Animated.View
                style={[
                  styles.indicatorContainer,
                  styles.ignoreContainer,
                  ignoreIndicatorStyle,
                ]}
              >
                <Text style={styles.indicatorText}>NOPE</Text>
              </Animated.View>
            </View>

            <View
              style={[
                styles.contentContainer,
                { padding: isSmallCard ? 5 : 16 },
              ]}
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
                {!isSmallCard && (
                  <Text style={styles.ratingText}>{rating} </Text>
                )}

                <View style={styles.starsContainer}>{renderStars()}</View>
                <Text
                  style={[
                    styles.ratingText,
                    { fontSize: isSmallCard ? 9 : 16 },
                  ]}
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
                    <Text style={styles.detailtimeText}>
                      Prep time: {prepTime}
                    </Text>
                    <Text style={styles.detailtimeText}>
                      Cook time: {cookTime}
                    </Text>
                  </View>

                  <Text numberOfLines={6} style={styles.description}>
                    {description}
                  </Text>

                  <TouchableOpacity
                    style={styles.readMore}
                    onPress={onReadMore}
                    disabled={!isActiveCard} // Only allow sharing the top card
                  >
                    <MaterialIcons name="read-more" size={24} color="black" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
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
        shadowOffset: { width: 0, height: 4 },
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
    position: "relative",
  },
  cardContent: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EFDCAB",
    position: "relative",
  },
  imageContainer: {
    backgroundColor: "#f0f0f0", // Placeholder color
    position: "relative",
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
  readMore: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorContainer: {
    position: "absolute",
    top: 30,
    padding: 10,
    borderWidth: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  likeContainer: {
    left: 20,
    borderColor: "#4CAF50",
  },
  ignoreContainer: {
    right: 20,
    borderColor: "#F44336",
  },
  indicatorText: {
    fontSize: 32,
    fontWeight: "bold",
  },
});

export default RecipeCard;
