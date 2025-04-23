import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useAuth } from "../../../hooks/useAuth";

export default function ProfileLayout() {
  const { userID, isLoading } = useAuth();

  return (
    <Stack 
      screenOptions={{
        headerShown: false, // Hide the header to use our custom header in the component
        contentStyle: {
          backgroundColor: "#F8F5E9", // Match the background color from the design
        },
        animation: Platform.OS === "ios" ? "default" : "fade_from_bottom",
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[userId]" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}