import { StyleSheet, Text, View } from "react-native";
import NotificationButton from "./NotificationButton";

const RED = "#730000";

/*
  Reusable ScreenHeader component.

  Purpose:
  - Ginagamit sa screens na may title, subtitle, and notification bell.
  - Example: Dashboard, Find Donor, Request, Message, Profile.
*/
type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showNotification?: boolean;
  hasNotification?: boolean;
  onNotificationPress?: () => void;
};

export default function ScreenHeader({
  title,
  subtitle,
  showNotification = true,
  hasNotification = true,
  onNotificationPress,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.textBox}>
        <Text style={styles.title}>{title}</Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {showNotification && (
        <NotificationButton
          hasNotification={hasNotification}
          onPress={onNotificationPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  textBox: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: RED,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },
});