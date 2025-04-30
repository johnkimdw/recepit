import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { router } from "expo-router";

// Import the components
import LoginSheet from "../components/LoginSheet";
import SignupSheet from "../components/SignupSheet";
import WelcomeButtons from "../components/WelcomeButtons";
import { useAuth } from "@/hooks/useAuth";
import { UserData } from "@/hooks/useAuth";

export default function WelcomeScreen() {
  // State to track which mode we're in
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showLoginContent, setShowLoginContent] = useState(false);
  const [showSignupContent, setShowSignupContent] = useState(false);

  const [error, setError] = useState("");

  const { login, register } = useAuth();

  // Animation value for sheet height
  const sheetAnimation = useRef(new Animated.Value(0)).current;

  const handleUserPress = () => {
    // We'll set the signup mode from the callback in WelcomeButtons component
    // Start sheet animation
    Animated.timing(sheetAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNewUserFadeOutComplete = () => {
    // Once the welcome buttons fade out is complete, show the signup content
    setIsSignupMode(true);
    setShowSignupContent(true);
  };

  const handleFadeOutComplete = () => {
    // Once the welcome buttons fade out is complete, show the login content
    setIsLoginMode(true);
    setShowLoginContent(true);
  };

  const handleLogin = async (email: string, password: string) => {
    // Handle login logic here
    console.log("Logging in with:", email, password);
    // You would typically call your authentication service here
    const message = await login(email, password);
    if (message === "success") {
      router.replace("/(tabs)");
    } else {
      setError(message);
    }
  };

  const handleSignup = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    console.log("Signing up with:", username, email, password, confirmPassword);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // You would typically call your registration service here
    const userData: UserData = {
      username,
      email,
      password,
    };
    const message = await register(userData);

    if (message === "success") {
      switchToLogin();
    } else {
      setError(message);
    }
  };

  const switchToLogin = () => {
    // Hide signup content
    setShowSignupContent(false);

    // Show login content
    setIsSignupMode(false);
    setIsLoginMode(true);
    setShowLoginContent(true);
  };

  const switchToSignup = () => {
    // Hide login content
    setShowLoginContent(false);

    // Show signup content
    setIsLoginMode(false);
    setIsSignupMode(true);
    setShowSignupContent(true);
  };

  const handleBackToWelcome = () => {
    // Hide content first
    setShowLoginContent(false);
    setShowSignupContent(false);

    // Animate the sheet back down
    Animated.timing(sheetAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsLoginMode(false);
      setIsSignupMode(false);
    });
  };

  // Calculate the sheet height based on animation value
  const welcomeSheetHeight = height * 0.5;
  const expandedSheetHeight = height * 0.85;

  const animatedSheetHeight = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [welcomeSheetHeight, expandedSheetHeight],
  });

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {/* Main background with header content */}
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>
          Welcome To{"\n"}
          Receipt{"\n"}
        </Text>

        <Image
          source={require("../assets/images/food1.png")}
          style={[styles.foodImage, styles.foodImageLeft]}
          resizeMode="contain"
        />

        <Image
          source={require("../assets/images/food2.png")}
          style={[styles.foodImage, styles.foodImageRight]}
          resizeMode="contain"
        />

        <Image
          source={require("../assets/images/food3.png")}
          style={[styles.foodImage, styles.foodImageTop]}
          resizeMode="contain"
        />
      </View>

      {/* Floating bottom sheet */}
      <Animated.View
        style={[styles.bottomSheet, { height: animatedSheetHeight }]}
      >
        {!isLoginMode && !isSignupMode ? (
          // Welcome mode content
          <WelcomeButtons
            onUserPress={handleUserPress}
            onCurrentUserFadeOutComplete={handleFadeOutComplete}
            onNewUserFadeOutComplete={handleNewUserFadeOutComplete}
          />
        ) : isLoginMode && showLoginContent ? (
          // Login mode content - only show after welcome content has faded out
          <LoginSheet
            onSignUpPress={switchToSignup}
            onLoginSubmit={handleLogin}
          />
        ) : isSignupMode && showSignupContent ? (
          // Signup mode content - only show after welcome content has faded out
          <SignupSheet
            onLoginPress={switchToLogin}
            onSignupSubmit={handleSignup}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
    position: "relative",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    paddingTop: 170,
  },
  welcomeText: {
    fontFamily: "Lora-Bold",
    fontSize: 48,
    color: "#D98324",
    textAlign: "center",
    lineHeight: 60,
    zIndex: 99,
  },
  foodImage: {
    width: 90,
    height: 90,
    position: "absolute",
  },
  foodImageLeft: {
    top: "40%",
    left: "10%",
  },
  foodImageRight: {
    top: "10%",
    right: "15%",
  },
  foodImageTop: {
    top: "37%",
    right: "15%",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#EFDCAB",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    gap: 30,
    zIndex: 999,
  },
  errorText: {
    width: "50%",
    color: "red",
    textAlign: "center",
    position: "absolute",
    borderRadius: 10,
    elevation: 5,
    top: 30,
    left: "25%",
    right: "25%",
    zIndex: 999,
    fontSize: 16,
    backgroundColor: "white",
    padding: 10,
  },
});
