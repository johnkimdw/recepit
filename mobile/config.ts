import { Platform } from "react-native";

// The backend API URL based on platform
export const API_URL =
  Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_TEST_WEB
    : "http://10.31.143.39:8000/api/v1"; // Your computer's local IP address
