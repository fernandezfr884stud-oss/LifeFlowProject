import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  /*
    This controls if the password is visible or hidden.
  */
  const [showPassword, setShowPassword] = useState(false);

  /*
    This is used for navigation.
    Example: going to dashboard or register page.
  */
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* =========================
          BRAND HEADER
          Layout: [Picture] [LIFEFLOW]
      ========================== */}
      <View style={styles.brandRow}>
        <Image
          source={require("../../assets/images/LoginLogo.png")}
          style={styles.brandLogo}
          resizeMode="contain"
        />

        <Text style={styles.brandName}>LifeFlow</Text>
      </View>

      {/* =========================
          PAGE TITLE
      ========================== */}
      <Text style={styles.title}>Connecting veins, saving lives</Text>
      <Text style={styles.description}>Welcome to LifeFlow!</Text>

      {/* =========================
          EMAIL INPUT
      ========================== */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* =========================
          PASSWORD INPUT
      ========================== */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
        />

        {/* Eye icon for show/hide password */}
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="#777"
          />
        </TouchableOpacity>
      </View>

      {/* =========================
          FORGOT PASSWORD
      ========================== */}
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* =========================
          SIGN IN BUTTON
      ========================== */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.buttonText}>SIGN IN</Text>
      </TouchableOpacity>

      {/* =========================
          REGISTER LINK
      ========================== */}
      <View style={styles.registerRow}>
        <Text style={styles.bottomText}>Don't have an account?</Text>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /*
    Main page container.
  */
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 25,
    justifyContent: "center",
  },

  /*
    Brand row:
    Logo on the left, LIFEFLOW text on the right.
  */
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  /*
    Change logo size here.
  */
  brandLogo: {
    width: 85,
    height: 85,
    marginRight: 10,
  },

  /*
    LIFEFLOW brand text beside the logo.
  */
  brandName: {
    fontSize: 50,
    fontWeight: "900",
    color: "#730000",
    letterSpacing: 1,
  },

  /*
    Page title.
  */
  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#222",
    textAlign: "center",
  },

  /*
    Subtitle under title.
  */
  description: {
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 35,
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
    Password input container.
  */
  passwordContainer: {
    backgroundColor: "#F1F1F1",
    height: 55,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  /*
    Forgot password text.
  */
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#730000",
    fontWeight: "600",
    marginBottom: 25,
  },

  /*
    Sign in button.
  */
  button: {
    backgroundColor: "#730000",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  /*
    Register section at the bottom.
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
    color: "#730000",
    fontWeight: "bold",
    marginLeft: 5,
  },
});