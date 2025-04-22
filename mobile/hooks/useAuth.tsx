import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { API_URL } from "../config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Define types for our auth context

type AuthContextType = {
  userID: string | null;
  isLoading: boolean;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<string>;
  register: (userData: UserData) => Promise<string>;
  logout: () => void;
  refresh: () => Promise<string>;
};

export type UserData = {
  username: string;
  email: string;
  password: string;
};

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  userID: null,
  isLoading: true,
  accessToken: null,
  login: async (username: string, password: string) =>
    Promise.resolve("success"),
  register: async (userData: UserData) => Promise.resolve("success"),
  logout: () => {},
  refresh: async () => Promise.resolve("success"),
});

type AuthProviderProps = {
  children: ReactNode;
};

const api_users = API_URL + "/users";
const api_auth = API_URL + "/auth";

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userID, setUserID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      const storedAccessToken = await AsyncStorage.getItem("accessToken");
      const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

      console.log(
        "storedAccessToken, storedRefreshToken",
        storedAccessToken,
        storedRefreshToken
      );

      if (storedAccessToken) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);

        try {
          // Verify token and get user data
          const response = await axios.get(api_users + "/me", {
            headers: {
              Authorization: `Bearer ${storedAccessToken}`,
            },
          });

          console.log("response", response);

          if (response.data) {
            setUserID(response.data.user_id);
          } else {
            // If token is invalid, try refreshing
            const refreshed = await refresh();
            if (!refreshed) {
              // If refresh fails, clear auth state
              logout();
            }
          }
        } catch (error: any) {
          console.error("Token validation failed:", error.response.data.detail);

          // If unauthorized or token expired, try to refresh the token
          if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
          ) {
            const refreshed = await refresh();
            if (!refreshed) {
              logout();
            }
          }
        }
      }

      setIsLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log(
        "Attempting login with:",
        username,
        "to URL:",
        api_auth + "/login"
      );

      const response = await axios.post(
        api_auth + "/login",
        new URLSearchParams({
          username,
          password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          // withCredentials doesn't work properly in React Native
          withCredentials: Platform.OS === "web",
        }
      );

      if (!response.data) {
        console.log("Login failed: No data returned");
        return "No data returned from server";
      }

      const data = response.data;
      console.log("Login response:", data);
      setAccessToken(data.access_token);
      setUserID(data.user_id);
      setRefreshToken(data.refresh_token);

      await AsyncStorage.setItem("accessToken", data.access_token);
      await AsyncStorage.setItem("refreshToken", data.refresh_token);

      return "success";
    } catch (error: any) {
      console.error("Login failed:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        return error.response.data.detail || `Error ${error.response.status}`;
      } else if (error.request) {
        console.error("Error request:", error.request);
        return "No response received from server. Check your network connection.";
      } else {
        console.error("Error message:", error.message);
        return error.message;
      }
    }
  };

  const logout = async () => {
    setAccessToken(null);
    setUserID(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    // TODO: implement logout
    // try {
    //   const response = await axios.post(
    //     api + "logout/",
    //     {},
    //     { withCredentials: true }
    //   );

    //   if (!response.data) {
    //     throw new Error("Logout failed");
    //   }
    // } catch (error) {
    //   console.error("Logout failed:", error);
    // }
  };

  const register = async (userData: UserData) => {
    try {
      console.log(
        "Registering user:",
        userData,
        "to URL:",
        api_auth + "/register"
      );
      const response = await axios.post(api_auth + "/register", userData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: Platform.OS === "web",
      });

      if (!response.data) {
        console.log("Registration failed: No data returned");
        return "No data returned from server";
      }

      const data = response.data;
      console.log("Registration response:", data);

      return "success";
    } catch (error: any) {
      console.error("Registration failed:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        return error.response.data.detail || `Error ${error.response.status}`;
      } else if (error.request) {
        console.error("Error request:", error.request);
        return "No response received from server. Check your network connection.";
      } else {
        console.error("Error message:", error.message);
        return error.message;
      }
    }
  };

  const refresh = async () => {
    try {
      console.log(
        "Attempting to refresh token with URL:",
        api_auth + "/refresh"
      );
      const response = await axios.post(
        api_auth + "/refresh",
        { refresh_token: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: Platform.OS === "web",
        }
      );

      if (!response.data) {
        console.log("Token refresh failed: No data returned");
        return "No data returned from server";
      }

      const data = response.data;
      console.log("Refresh response:", data);
      setAccessToken(data.access_token);
      setUserID(data.user_id);

      await AsyncStorage.setItem("accessToken", data.access_token);

      return "success";
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        return error.response.data.detail || `Error ${error.response.status}`;
      } else if (error.request) {
        console.error("Error request:", error.request);
        return "No response received from server. Check your network connection.";
      } else {
        console.error("Error message:", error.message);
        return error.message;
      }
    }
  };

  // Value object to be provided to consumers
  const value = {
    userID,
    isLoading,
    accessToken,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
