import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PasswordField from "../components/PasswordField";

const RED = "#730000";

/*
  Backend-ready login payload.

  Purpose:
  - Ito yung data na ipapasa sa backend later.
  - Backend partner can use this format.
*/
type LoginPayload = {
  email: string;
  password: string;
};

/*
  Backend placeholder.

  Purpose:
  - Ready-to-connect function.
  - Later, papalitan ito ng real API call.
*/
const loginUser = async (payload: LoginPayload) => {
  console.log("Login payload ready for backend:", payload);

  /*
    Temporary success response for front-end demo.
    Later, backend should return user data and token/session.
  */
  return {
    success: true,
    user: {
      id: 1,
      email: payload.email,
    },
  };
};

export default function LoginScreen() {
  const router = useRouter();

  /*
    Params can come from Register screen.
    Example: after successful register, email can be auto-filled here.
  */
  const params = useLocalSearchParams<{
    registered?: string;
    email?: string;
  }>();

  /*
    Form states.

    Purpose:
    - Stores email and password typed by user.
  */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /*
    UI states.

    Purpose:
    - showPassword controls eye icon.
    - isSubmitting shows loading spinner while logging in.
    - successMessage appears after coming from registration.
  */
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /*
    If user came from Register, auto-fill email and show message.
  */
  useEffect(() => {
    if (params.email) {
      setEmail(String(params.email));
    }
  }, [params.email]);

  /*
    Front-end validation.

    Purpose:
    - Prevents empty or invalid login attempt.
    - Backend should still validate again later.
  */
  const validateLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return false;
    }

    return true;
  };

  /*
    Login function.

    Purpose:
    - Validates login form.
    - Builds backend-ready payload.
    - Calls loginUser placeholder.
    - Redirects to dashboard if login is successful.
  */
  const handleLogin = async () => {
    if (!validateLogin()) return;

    const payload: LoginPayload = {
      email: email.trim().toLowerCase(),
      password,
    };

    try {
      setIsSubmitting(true);
      Keyboard.dismiss();

      const response = await loginUser(payload);

      if (!response.success) {
        Alert.alert("Login failed", "Invalid email or password.");
        return;
      }

      /*
        After successful login, go to dashboard.

        Later:
        - Save auth token/session here.
        - Store user data globally or fetch profile from backend.
      */
      router.replace("/dashboard");
    } catch (error) {
      Alert.alert("Something went wrong", "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand header: logo + app name */}
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/images/LoginLogo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          <Text style={styles.brandName}>LifeFlow</Text>
        </View>

        {/* Welcome text */}
        <Text style={styles.title}>Connecting veins, saving lives</Text>
        <Text style={styles.description}>Welcome to LifeFlow!</Text>

        {/* Email input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Reusable password input with eye icon */}
        <PasswordField
          placeholder="Password"
          value={password}
          visible={showPassword}
          onChangeText={setPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />

        {/* Forgot password */}
        <TouchableOpacity activeOpacity={0.85}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign in button */}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.disabledButton]}
          activeOpacity={0.85}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>SIGN IN</Text>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.bottomText}>Don't have an account?</Text>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /*
    Full screen wrapper.
  */
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /*
    Scroll content.
    This keeps the login form centered but still scrollable on small screens.
  */
  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
  },

  /*
    Brand header.
  */
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  brandLogo: {
    width: 85,
    height: 85,
    marginRight: 10,
  },

  brandName: {
    fontSize: 50,
    fontWeight: "900",
    color: RED,
    letterSpacing: 1,
  },

  /*
    Page text.
  */
  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#222",
    textAlign: "center",
  },

  description: {
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 25,
    fontSize: 14,
  },

  /*
    Email input.
  */
  input: {
    backgroundColor: "#F1F1F1",
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 20,
    marginBottom: 12,
    fontSize: 15,
    color: "#333",
  },

  /*
    Forgot password.
  */
  forgotPassword: {
    alignSelf: "flex-end",
    color: RED,
    fontWeight: "700",
    marginBottom: 25,
  },

  /*
    Sign in button.
  */
  button: {
    backgroundColor: RED,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  /*
    Register link.
  */
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  bottomText: {
    color: "#666",
  },

  link: {
    color: RED,
    fontWeight: "900",
    marginLeft: 5,
  },
});