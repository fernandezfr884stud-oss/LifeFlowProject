import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/*
  AI slides contain both the message and the image.
  Every 5 seconds, the dashboard will show the next image and message.
*/
const aiSlides: { message: string; image: ImageSourcePropType }[] = [
  {
    message: "Hello! Need some help?",
    image: require("../../../assets/images/HelloLogo.png"),
  },
  {
    message: "Looking for a blood donor?",
    image: require("../../../assets/images/FindLogo.png"),
  },
  {
    message: "You are not alone. LifeFlow can help.",
    image: require("../../../assets/images/EncourageLogo.png"),
  },
];

export default function DashboardScreen() {
  /*
    aiIndex controls what AI image and message is currently shown.
    showSearch controls if the AI card is showing the AI helper or the search bar.
    bloodType stores the blood type typed by the user.
  */
  const [aiIndex, setAiIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [bloodType, setBloodType] = useState("");

  /*
    This changes the AI picture and message every 5 seconds.
    It repeats from the first slide after the last slide.
  */
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setAiIndex((currentIndex) => (currentIndex + 1) % aiSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  /*
    This function runs when the user searches a blood type.
    It sends the blood type to the Find Donor tab.
    After searching, it resets the AI card back to normal.
  */
  const handleSearch = () => {
    const cleanedBloodType = bloodType.trim().toUpperCase();

    // If the input is empty, do nothing.
    if (!cleanedBloodType) {
      return;
    }

    Keyboard.dismiss();

    /*
      Reset the AI container before going to Find Donor.
      This makes sure that when the user goes back to Dashboard,
      the AI helper is shown again instead of the search bar.
    */
    setShowSearch(false);
    setBloodType("");

    router.push({
      pathname: "/finddonor",
      params: {
        bloodType: cleanedBloodType,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header: App name on the left, notification bell on the right */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>LifeFlow</Text>
          <Text style={styles.tagline}>Blood help made faster</Text>
        </View>

        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={24} color="#730000" />

          {/* This is only a design dot for notification */}
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

        {/* AI Helper Card */}
        <View style={styles.aiCard}>
          {!showSearch ? (
            /*
              Normal AI helper view.
              Layout:
              [AI Image] [Changing message]
              [Tap me to search blood type]
            */
            <View>
              <View style={styles.aiTopRow}>
                {/* AI image on the left */}
                <View style={styles.aiImageWrapper}>
                  <Image
                    source={aiSlides[aiIndex].image}
                    style={styles.aiImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Changing message on the right */}
                <View style={styles.aiMessageBox}>
                  <View style={styles.aiMessageRow}>
                    <Ionicons name="sparkles" size={17} color="#FFFFFF" />

                    <Text style={styles.aiMessage}>
                      {aiSlides[aiIndex].message}
                    </Text>
                  </View>
                </View>
              </View>

              {/* This is the clickable text that opens the search bar */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowSearch(true)}
              >
                <Text style={styles.tapHint}>Tap me to search blood type</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /*
              Search view.
              This replaces the AI image and message when the user taps the search text.
            */
            <View style={styles.fullSearchContainer}>
              <Text style={styles.searchTitle}>Search blood type</Text>

              <View style={styles.fullSearchBar}>
                <TextInput
                  style={styles.fullSearchInput}
                  placeholder="Enter blood type"
                  placeholderTextColor="#B8B8B8"
                  value={bloodType}
                  onChangeText={setBloodType}
                  autoFocus
                  autoCapitalize="characters"
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />

                <TouchableOpacity
                  style={styles.fullSearchButton}
                  activeOpacity={0.85}
                  onPress={handleSearch}
                >
                  <Ionicons name="search" size={21} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.searchExample}>
                Example: Type O+, A-, or AB+
              </Text>

              {/* Optional: user can cancel search and go back to normal AI view */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowSearch(false);
                  setBloodType("");
                }}
              >
                <Text style={styles.cancelSearch}>Cancel search</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      {/* About LifeFlow section */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>What is LifeFlow?</Text>

        <Text style={styles.description}>
          LifeFlow is a mobile-based blood donor and request system designed to
          help users find possible blood donors faster. It helps connect people
          who need blood with available donors based on important details such as
          blood type and location.
        </Text>
      </View>

      {/* How to use LifeFlow section */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>How to use it?</Text>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>

          <Text style={styles.stepText}>
            Search for the blood type you need using the AI helper.
          </Text>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>

          <Text style={styles.stepText}>
            Go to the Find Donor tab to view matching donors.
          </Text>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>

          <Text style={styles.stepText}>
            Send a request or contact the donor once available.
          </Text>
        </View>
      </View>

      {/* Extra space so content will not be hidden by the bottom tab bar */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /*
    Main screen style.
  */
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  /*
    Header styles.
  */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#730000",
  },

  tagline: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1F1",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 13,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E60000",
  },

      /*
        AI card styles.
      */
    /*
      Smaller AI card.
      Hindi na siya sobrang taas compared sa previous version.
    */
    aiCard: {
      minHeight: 160,
      borderRadius: 28,
      backgroundColor: "#730000",
      padding: 16,
      justifyContent: "center",
      marginBottom: 22,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 5,
    },

      /*
        Top row layout:
        [AI Image] [Description]
      */
      aiTopRow: {
        flexDirection: "row",
        alignItems: "center",
      },

      /*
        AI image container on the left.
      */
      aiImageWrapper: {
        width: 82,
        height: 82,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
      },

      aiImage: {
        width: 82,
        height: 82,
      },

      /*
        Message box on the right side of the AI image.
      */
      aiMessageBox: {
        flex: 1,
        minHeight: 78,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        padding: 13,
        justifyContent: "center",
      },

      /*
        Sparkles icon + changing message.
      */
      aiMessageRow: {
        flexDirection: "row",
        alignItems: "flex-start",
      },

      aiMessage: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "800",
        color: "#FFFFFF",
        lineHeight: 22,
      },

      /*
        Search clickable text below the AI row.
      */
      tapHint: {
        marginTop: 13,
        color: "#F8DADA",
        fontSize: 13,
        fontWeight: "700",
        textDecorationLine: "underline",
        textAlign: "center",
      },

      /*
        Search container shown after tapping "Tap me".
      */
      fullSearchContainer: {
        width: "100%",
      },

      searchTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#FFFFFF",
        marginBottom: 12,
      },

      fullSearchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingLeft: 15,
        paddingRight: 6,
        height: 54,
      },

      fullSearchInput: {
        flex: 1,
        height: "100%",
        fontSize: 16,
        color: "#333",
      },

      fullSearchButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: "#B00000",
        justifyContent: "center",
        alignItems: "center",
      },

      searchExample: {
        marginTop: 10,
        fontSize: 13,
        color: "#F8DADA",
        fontWeight: "600",
      },

      cancelSearch: {
        marginTop: 10,
        fontSize: 13,
        color: "#FFFFFF",
        fontWeight: "700",
        textAlign: "center",
      },

  /*
    Info card styles.
  */
  infoCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE1E1",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#730000",
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
  },

  /*
    Step guide styles.
  */
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },

  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#730000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  stepNumberText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
  },

  bottomSpace: {
    height: 120,
  },
});