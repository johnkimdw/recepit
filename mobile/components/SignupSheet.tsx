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
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

interface SignupSheetProps {
  onLoginPress: () => void;
  onSignupSubmit: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => void;
}

const SignupSheet: React.FC<SignupSheetProps> = ({
  onLoginPress,
  onSignupSubmit,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Start fade-in animation when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignup = () => {
    onSignupSubmit(username, email, password, confirmPassword);
  };

  return (
    <Animated.View style={[styles.signupContainer, { opacity: fadeAnim }]}>
      <Text style={styles.signupTitle}>Welcome!</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor="rgba(128, 128, 128, 0.5)"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          placeholderTextColor="rgba(128, 128, 128, 0.5)"
          keyboardType="email-address"
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor="rgba(128, 128, 128, 0.5)"
            autoCapitalize="none"
          />
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Text>
              {showConfirmPassword ? (
                <Entypo name="eye" size={24} color="grey" />
              ) : (
                <Entypo name="eye-with-line" size={24} color="grey" />
              )}
            </Text>
          </Pressable>
        </View>
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>SIGN UP</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={onLoginPress}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  signupContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
  },
  signupTitle: {
    fontFamily: "Lora-Bold",
    fontSize: 40,
    color: "#D98324",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
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
  signupButton: {
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
  signupButtonText: {
    fontFamily: "Lora-regular",
    fontSize: 20,
    color: "#000000",
  },
  loginContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  loginText: {
    fontFamily: "Lora-Regular",
    fontSize: 16,
    color: "#000",
    marginRight: 10,
  },
  loginLink: {
    fontFamily: "Lora-Bold",
    fontSize: 16,
    color: "#000",
    textDecorationLine: "underline",
  },
});

export default SignupSheet;
