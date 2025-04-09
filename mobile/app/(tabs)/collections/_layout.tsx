import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function CollectionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#F8F5E9",
        },
        headerShadowVisible: false,
        headerBackTitle: "Collections",
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
        name="likes"
        options={{
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="saved"
        options={{
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
