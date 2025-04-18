import { Platform } from "react-native";

// The backend API URL based on platform
export const API_URL =
  Platform.OS === "web"
    ? "http://localhost:8000/api/v1"
    : "http://10.24.197.61:8000/api/v1"; // Your computer's local IP address
