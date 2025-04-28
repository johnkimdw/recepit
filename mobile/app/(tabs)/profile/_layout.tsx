import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useAuth } from "../../../hooks/useAuth";

export default function ProfileLayout() {
  const { userID, isLoading } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#F8F5E9",
        },
        headerShadowVisible: false,
        headerBackTitle: "Profile",
        headerTintColor: "#000000",
        headerTitle: "",
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
      <Stack.Screen
        name="grocery-list"
        options={{
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
