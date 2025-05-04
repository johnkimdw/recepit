import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ColorSchemeName } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Provider } from "react-redux";
import { store } from "@/store";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Lora-Regular": require("../assets/fonts/Lora-Regular.ttf"),
    "Lora-Bold": require("../assets/fonts/Lora-Bold.ttf"),
  });

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          <Text>Social</Text>
          {"\n"}
          <Text>Cooking</Text>
        </Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <InnerApp colorScheme={colorScheme} />
      </AuthProvider>
    </Provider>
  );
}

function InnerApp({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const { userID } = useAuth();

  useEffect(() => {
    SplashScreen.hideAsync();

    if (userID) {
      router.replace("/(tabs)");
    }
  }, [userID]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            initialRouteName="index"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFDCAB", // The specified background color
  },
  title: {
    fontFamily: "Lora-Bold",
    textAlign: "center",
    lineHeight: 50,
    color: "#D98324",
    fontSize: 36,
  },
});
