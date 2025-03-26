import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  const navigateToSignup = () => {
    // Use type assertion to avoid TypeScript errors
    router.push("signup" as any);
  };

  const navigateToLogin = () => {
    // Use type assertion to avoid TypeScript errors
    router.push("login" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome To{"\n"}
            Social{"\n"}
            Cooking
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

        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.button} onPress={navigateToSignup}>
            <Text style={styles.buttonText}>New User</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={navigateToLogin}>
            <Text style={styles.buttonText}>Current User</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  content: {
    flex: 1,
  },
  header: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    position: "relative",
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
    bottom: "15%",
    left: "15%",
  },
  foodImageRight: {
    bottom: "10%",
    right: "15%",
  },
  foodImageTop: {
    top: "20%",
    right: "20%",
  },
  bottomSheet: {
    flex: 2,
    backgroundColor: "#EFDCAB",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 50,
    gap: 30,
    position: "relative",
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
