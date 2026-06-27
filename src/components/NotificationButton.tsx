import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RED = "#730000";

/*
  Reusable NotificationButton component.

  Purpose:
  - Ginagamit sa ScreenHeader.
  - Kapag pinindot, pupunta sa notifications screen.
  - Shows dot or unread count.
*/
type NotificationButtonProps = {
  unreadCount?: number;
  hasNotification?: boolean;
  onPress?: () => void;
};

export default function NotificationButton({
  unreadCount = 0,
  hasNotification = true,
  onPress,
}: NotificationButtonProps) {
  const showBadge = unreadCount > 0 || hasNotification;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.push("/notifications");
  };

  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <Ionicons name="notifications-outline" size={24} color={RED} />

      {/* Badge or red dot */}
      {showBadge && (
        <View style={unreadCount > 0 ? styles.countBadge : styles.dot}>
          {unreadCount > 0 && (
            <Text style={styles.countText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1F1",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  dot: {
    position: "absolute",
    top: 13,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E60000",
  },

  countBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E60000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  countText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
});