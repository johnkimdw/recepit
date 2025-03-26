import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign Up Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5E9",
  },
  text: {
    fontFamily: "Lora-Bold",
    fontSize: 24,
    color: "#D98324",
  },
});
