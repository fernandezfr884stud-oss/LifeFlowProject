import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RED = "#730000";

/*
  Valid blood types.

  Purpose:
  - Para hindi makapag-search ng invalid input like "abc" or "123".
*/
const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/*
  AI slides.

  Purpose:
  - Nagpapalit-palit yung AI image and message every few seconds.
  - Make sure existing yung image files sa assets/images.
  - dito magdadagdag ng sasabihin if want pa magdagdag
*/
const aiSlides: { message: string; image: ImageSourcePropType }[] = [
  {
    message: "Hello! Need some help?",
    image: require("../../assets/images/HelloLogo.png"),
  },
  {
    message: "Looking for a blood donor?",
    image: require("../../assets/images/FindLogo.png"),
  },
  {
    message: "You are not alone. LifeFlow can help.",
    image: require("../../assets/images/EncourageLogo.png"),
  },
];

/*
  AIHelperCard props.

  Purpose:
  - onSearch sends the selected blood type back to dashboard.
  - Dashboard will handle navigation to Find Donor.
*/
type AIHelperCardProps = {
  onSearch: (bloodType: string) => void;
};

export default function AIHelperCard({ onSearch }: AIHelperCardProps) {
  const [aiIndex, setAiIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [bloodType, setBloodType] = useState("");

  /*
    Changes AI message and image every 5 seconds.
  */
  useEffect(() => {
    const interval = setInterval(() => {
      setAiIndex((current) => (current + 1) % aiSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /*
    Handles blood type search.
  */
  const handleSearch = () => {
    const cleanedBloodType = bloodType.trim().toUpperCase();

    if (!cleanedBloodType) {
      Alert.alert("Missing blood type", "Please enter a blood type.");
      return;
    }

    if (!validBloodTypes.includes(cleanedBloodType)) {
      Alert.alert(
        "Invalid blood type",
        "Please enter a valid blood type like A+, B-, AB+, or O-."
      );
      return;
    }

    Keyboard.dismiss();

    /*
      Reset AI card before going to Find Donor.
      Para pagbalik sa dashboard, normal AI helper ulit.
    */
    setBloodType("");
    setShowSearch(false);

    onSearch(cleanedBloodType);
  };

  return (
    <View style={styles.card}>
      {!showSearch ? (
        <View>
          <View style={styles.topRow}>
            {/* AI image on the left */}
            <View style={styles.imageWrapper}>
              <Image
                source={aiSlides[aiIndex].image}
                style={styles.aiImage}
                resizeMode="contain"
              />
            </View>

            {/* Changing message on the right */}
            <View style={styles.messageBox}>
              <View style={styles.messageRow}>
                <Ionicons name="sparkles" size={17} color="#FFFFFF" />

                <Text style={styles.message}>
                  {aiSlides[aiIndex].message}
                </Text>
              </View>
            </View>
          </View>

          {/* Opens search bar */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowSearch(true)}
          >
            <Text style={styles.tapHint}>Tap me to search blood type</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.searchTitle}>Search blood type</Text>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
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
              style={styles.searchButton}
              activeOpacity={0.85}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={21} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.exampleText}>Example: Type O+, A-, or AB+</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setBloodType("");
              setShowSearch(false);
            }}
          >
            <Text style={styles.cancelText}>Cancel search</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    borderRadius: 28,
    backgroundColor: RED,
    padding: 16,
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  imageWrapper: {
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

  messageBox: {
    flex: 1,
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 13,
    justifyContent: "center",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  message: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 22,
  },

  tapHint: {
    marginTop: 13,
    color: "#F8DADA",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
    textAlign: "center",
  },

  searchTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingLeft: 15,
    paddingRight: 6,
    height: 54,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#B00000",
    justifyContent: "center",
    alignItems: "center",
  },

  exampleText: {
    marginTop: 10,
    fontSize: 13,
    color: "#F8DADA",
    fontWeight: "600",
  },

  cancelText: {
    marginTop: 10,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
});