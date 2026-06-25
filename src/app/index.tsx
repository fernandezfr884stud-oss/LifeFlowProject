import { useRouter } from "expo-router";
import { Asset } from "expo-asset";
import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/*
  Minimum loading time para hindi biglang lipat at hindi mukhang nag-flash.
*/
const MIN_LOADING_TIME = 2500;

/*
  Kapag lumagpas dito, magpapakita tayo ng slow connection message.
*/
const SLOW_CONNECTION_TIME = 5000;

export default function LoadingScreen() {
  const router = useRouter();

  /*
    Fade animation para smooth lumabas yung logo/text.
  */
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [isOffline, setIsOffline] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    /*
      Smooth fade-in animation.
    */
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    checkConnectionAndContinue();
  }, []);

  const checkConnectionAndContinue = async () => {
    setIsOffline(false);
    setIsSlow(false);
    setStatusText("");

    /*
      If checking takes too long, show slow connection message.
    */
    const slowTimer = setTimeout(() => {
      setIsSlow(true);
      setStatusText("Connection seems slow...");
    }, SLOW_CONNECTION_TIME);

    try {
      const networkState = await Network.getNetworkStateAsync();

      /*
        isConnected checks if device has network connection.
        isInternetReachable can be false if internet is not reachable.
      */
      const hasInternet =
        networkState.isConnected && networkState.isInternetReachable !== false;

      clearTimeout(slowTimer);

      if (!hasInternet) {
        setIsOffline(true);
        setStatusText("No internet connection");
        return;
      }

      /*
        Delay muna para smooth at hindi biglang flash.
      */
     await Asset.loadAsync([
    require("../../assets/images/OnBoardPic1.png"),
    require("../../assets/images/OnBoardPic2.png"),
  ]);
      setTimeout(() => {
        router.replace("/onboarding1");
      }, MIN_LOADING_TIME);
    } catch (error) {
      clearTimeout(slowTimer);
      setIsOffline(true);
      setStatusText("Unable to check connection");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* App logo */}
        <Image
          source={require("../../assets/images/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* App name */}
        <Text style={styles.title}>LifeFlow</Text>

        {/* Status message */}
        {statusText ? (
          <Text style={styles.statusText}>{statusText}</Text>
        ) : null}

        {isSlow && !isOffline && (
          <Text style={styles.helperText}>
            Please wait while we prepare the app.
          </Text>
        )}

        {isOffline && (
          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.85}
            onPress={checkConnectionAndContinue}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  /*
    Main loading screen.
  */
  container: {
    flex: 1,
    backgroundColor: "#730000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  content: {
    alignItems: "center",
  },

  logo: {
    width: 175,
    height: 175,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 8,
  },

  tagline: {
    color: "#F8DADA",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 28,
  },

  helperText: {
    color: "#F8DADA",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 22,
  },

  retryText: {
    color: "#730000",
    fontSize: 14,
    fontWeight: "900",
  },
});