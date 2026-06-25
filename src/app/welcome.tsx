import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* App Name */}
      <Text style={styles.logo}>LIFEFLOW</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Connecting veins, saving lives.
      </Text>

      {/* Mascot */}
      <Image
        source={require("../../assets/images/WelcomeLogo.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Register Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.buttonText}>REGISTER</Text>
      </TouchableOpacity>

      {/* Login Text */}
        <Text style={styles.accountText}>
        Already have an account?{" "}
        <Text
            style={styles.signIn}
            onPress={() => router.push("/login")}
        >
            Sign in here
        </Text>
        </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  // Main Screen
  container: {
    flex: 1,
    backgroundColor: "#730000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  // App Name
  logo: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "900",
    marginBottom: 15,
  },

  // Tagline
  tagline: {
    color: "#FFFFFF",
    fontSize: 20,
    marginBottom: 60,
  },

  // Mascot
  image: {
    width: 280,
    height: 280,
    marginBottom: 70,
  },

  // Register Button
  button: {
    width: "85%",
    height: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#2B0000",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Login Text
accountText: {
  color: "#FFFFFF",
  fontSize: 18,
  marginTop: 55,
  textAlign: "center",
},

signIn: {
  textDecorationLine: "underline",
  fontWeight: "600",
},
});