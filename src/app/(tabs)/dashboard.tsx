import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AIHelperCard from "../../components/AIHelperCard";
import ScreenHeader from "../../components/ScreenHeader";

const RED = "#730000";

export default function DashboardScreen() {
  /*
    This receives blood type from AIHelperCard
    then redirects user to Find Donor tab with filter.
  */
  const handleBloodTypeSearch = (bloodType: string) => {
    router.push({
      pathname: "/finddonor",
      params: {
        bloodType,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Reusable header */}
      <ScreenHeader title="LifeFlow" subtitle="Blood help made faster" />

      {/* Reusable AI helper */}
      <AIHelperCard onSearch={handleBloodTypeSearch} />

      {/* About LifeFlow */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>What is LifeFlow?</Text>

        <Text style={styles.description}>
          LifeFlow is a mobile-based blood donor and request system designed to
          help users find possible blood donors faster. It helps connect people
          who need blood with available donors based on important details such as
          blood type and location.
        </Text>
      </View>

      {/* How to use LifeFlow */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>How to use it?</Text>

        <StepItem
          number="1"
          text="Search for the blood type you need using the AI helper."
        />

        <StepItem
          number="2"
          text="Go to the Find Donor tab to view matching donors."
        />

        <StepItem
          number="3"
          text="Send a request or contact the donor once available."
        />
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

/*
  Local reusable step item for dashboard only.

  Purpose:
  - Keeps the step guide clean and less repetitive.
  - If used in other screens later, we can move it to components.
*/
function StepItem({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>

      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
  },

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
    color: RED,
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
  },

  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },

  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: RED,
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