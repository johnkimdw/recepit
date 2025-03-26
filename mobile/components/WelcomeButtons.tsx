import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";

interface WelcomeButtonsProps {
  onUserPress: () => void;
  onCurrentUserFadeOutComplete?: () => void;
  onNewUserFadeOutComplete?: () => void;
}

const WelcomeButtons: React.FC<WelcomeButtonsProps> = ({
  onUserPress,
  onCurrentUserFadeOutComplete,
  onNewUserFadeOutComplete,
}) => {
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleCurrentUserWithFade = () => {
    // Start fade-out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Call the original handler after animation completes
      onUserPress();
      if (onCurrentUserFadeOutComplete) {
        onCurrentUserFadeOutComplete();
      }
    });
  };

  const handleNewUserWithFade = () => {
    // Start fade-out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Call the original handler after animation completes
      onUserPress();
      if (onNewUserFadeOutComplete) {
        onNewUserFadeOutComplete();
      }
    });
  };

  return (
    <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.button} onPress={handleNewUserWithFade}>
        <Text style={styles.buttonText}>New User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCurrentUserWithFade}
      >
        <Text style={styles.buttonText}>Current User</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 30,
  },
  button: {
    backgroundColor: "#F8F5E9",
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 70,
  },
  buttonText: {
    fontFamily: "Lora-Bold",
    fontSize: 24,
    color: "#000000",
  },
});

export default WelcomeButtons;
