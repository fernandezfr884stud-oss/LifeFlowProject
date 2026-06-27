import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const GREEN = "#178A3B";
const RED = "#B00000";

/*
  Reusable StatusBadge component.

  Purpose:
  - Shows status like Available, Not Available, Pending, Accepted, Rejected.
  - For now, ginagamit natin sa donor availability.
*/
type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isAvailable = status === "Available";

  return (
    <View style={[styles.badge, isAvailable ? styles.available : styles.notAvailable]}>
      <Ionicons
        name="ellipse"
        size={9}
        color={isAvailable ? GREEN : RED}
      />

      <Text style={[styles.text, { color: isAvailable ? GREEN : RED }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 7,
  },

  available: {
    backgroundColor: "#EAF8EF",
  },

  notAvailable: {
    backgroundColor: "#FFECEC",
  },

  text: {
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
});