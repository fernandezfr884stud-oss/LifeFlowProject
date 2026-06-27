import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RED = "#730000";

export type NotificationType =
  | "blood_request"
  | "request_accepted"
  | "request_rejected"
  | "proof_submitted"
  | "request_completed"
  | "system";

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedRequestId?: number;
  relatedConversationId?: number;
};

/*
  Reusable NotificationCard component.

  Purpose:
  - Displays one notification item.
  - Used inside notifications.tsx.
*/
type NotificationCardProps = {
  item: NotificationItem;
  onPress: () => void;
};

export default function NotificationCard({
  item,
  onPress,
}: NotificationCardProps) {
  const iconName = getNotificationIcon(item.type);
  const iconColor = getNotificationColor(item.type);

  return (
    <TouchableOpacity
      style={[styles.card, !item.isRead && styles.unreadCard]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconColor.bg }]}>
        <Ionicons name={iconName} size={22} color={iconColor.color} />
      </View>

      <View style={styles.textBox}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>

          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.message}>{item.message}</Text>

        <Text style={styles.time}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );
}

/*
  Returns icon depending on notification type.
*/
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "blood_request":
      return "water-outline";
    case "request_accepted":
      return "checkmark-circle-outline";
    case "request_rejected":
      return "close-circle-outline";
    case "proof_submitted":
      return "cloud-upload-outline";
    case "request_completed":
      return "shield-checkmark-outline";
    default:
      return "notifications-outline";
  }
}

/*
  Returns color depending on notification type.
*/
function getNotificationColor(type: NotificationType) {
  switch (type) {
    case "request_accepted":
    case "request_completed":
      return {
        bg: "#EAF8EF",
        color: "#178A3B",
      };
    case "request_rejected":
      return {
        bg: "#FFECEC",
        color: "#B00000",
      };
    case "proof_submitted":
      return {
        bg: "#FFF0C2",
        color: "#A36A00",
      };
    default:
      return {
        bg: "#FFF1F1",
        color: RED,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F1F1",
  },

  unreadCard: {
    backgroundColor: "#FFF7F7",
    borderColor: "#FFE1E1",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  textBox: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    flex: 1,
    color: "#222",
    fontSize: 15,
    fontWeight: "900",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E60000",
    marginLeft: 8,
  },

  message: {
    color: "#666",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  time: {
    color: "#999",
    fontSize: 12,
    marginTop: 7,
    fontWeight: "700",
  },
});