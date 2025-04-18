import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

interface LoginSheetProps {
  onSignUpPress: () => void;
  onLoginSubmit: (email: string, password: string) => void;
}

const LoginSheet: React.FC<LoginSheetProps> = ({
  onSignUpPress,
  onLoginSubmit,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Start fade-in animation when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = () => {
    onLoginSubmit(username, password);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {/* <TouchableWithoutFeedback onPress={dismissKeyboard}> */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.loginContainer, { opacity: fadeAnim }]}>
          <Text style={styles.loginTitle}>Welcome Back!</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="rgba(128, 128, 128, 0.5)"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor="rgba(128, 128, 128, 0.5)"
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text>
                  {showPassword ? (
                    <Entypo name="eye" size={24} color="grey" />
                  ) : (
                    <Entypo name="eye-with-line" size={24} color="grey" />
                  )}
                </Text>
              </Pressable>
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log("Forgot password")}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={onSignUpPress}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      {/* </TouchableWithoutFeedback> */}
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  loginContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
  },
  loginTitle: {
    fontFamily: "Lora-Bold",
    fontSize: 40,
    color: "#D98324",
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 25,
  },
  inputLabel: {
    fontFamily: "Lora-Regular",
    fontSize: 16,
    color: "#212121",
    marginBottom: 5,
    marginLeft: 15,
    opacity: 0.5,
  },
  input: {
    backgroundColor: "#F8F5E9",
    borderRadius: 40,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: "Lora-Regular",
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F5E9",
    borderRadius: 40,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: "Lora-Regular",
  },
  eyeIcon: {
    padding: 10,
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: "#F8F5E9",
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontFamily: "Lora-regular",
    fontSize: 20,
    color: "#000000",
  },
  forgotPassword: {
    fontFamily: "Lora-Regular",
    fontSize: 16,
    color: "#000",
    textDecorationLine: "underline",
    marginTop: 10,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 40,
    alignItems: "center",
  },
  signupText: {
    fontFamily: "Lora-Regular",
    fontSize: 16,
    color: "#000",
    marginRight: 10,
  },
  signupLink: {
    fontFamily: "Lora-Bold",
    fontSize: 16,
    color: "#000",
    textDecorationLine: "underline",
  },
});

export default LoginSheet;
