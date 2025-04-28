import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { useEffect } from "react";
  import { useRouter } from "expo-router";
  import { useAuth } from "@/hooks/useAuth";
  import { StatusBar } from "expo-status-bar";
  
  /**
   * Index component for the profile folder
   * This acts as a redirect to the current user's profile page
   */
  export default function ProfileIndexScreen() {
    const router = useRouter();
    const { userID, isLoading } = useAuth();
  
    // Redirect to the current user's profile once we have their ID
    useEffect(() => {
      if (!isLoading && userID) {
        router.replace(`/profile/${userID}`);
      }
    }, [userID, isLoading, router]);
  
    // Show loading screen while authentication is being checked
    if (isLoading || !userID) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D98324" />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        </SafeAreaView>
      );
    }
  
    // This is a fallback in case the redirect doesn't work
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Redirecting to your profile...</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace(`/profile/${userID}`)}
          >
            <Text style={styles.buttonText}>Go to my profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8F5E9",
    },
    contentContainer: {
      flex: 1,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: "#555",
      fontFamily: "Lora-Regular",
    },
    title: {
      fontFamily: "Lora-Bold",
      fontSize: 24,
      color: "#D98324",
      marginBottom: 10,
    },
    subtitle: {
      fontFamily: "Lora-Regular",
      fontSize: 16,
      color: "#555",
      marginBottom: 30,
      textAlign: "center",
    },
    button: {
      backgroundColor: "#D98324",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 20,
      marginTop: 20,
    },
    buttonText: {
      color: "white",
      fontFamily: "Lora-Bold",
      fontSize: 16,
    },
  });