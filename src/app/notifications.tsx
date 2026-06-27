import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NotificationCard, {
  NotificationItem,
} from "../components/NotificationCard";

const RED = "#730000";

/*
  Mock notification data.

  Purpose:
  - Front-end demo muna.
  - Later, backend will return notifications from database.
  - Notice: no per-message chat notification para hindi spammy.
*/
const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "New Blood Request",
    message: "Chloe requested O+ blood assistance. Review the request details.",
    type: "blood_request",
    isRead: false,
    createdAt: "Just now",
    relatedRequestId: 101,
  },
  {
    id: 2,
    title: "Request Accepted",
    message: "Steph accepted your blood request. You can now start chatting.",
    type: "request_accepted",
    isRead: false,
    createdAt: "5 min ago",
    relatedRequestId: 101,
    relatedConversationId: 1,
  },
  {
    id: 3,
    title: "Proof Submitted",
    message: "The other user submitted completion proof for verification.",
    type: "proof_submitted",
    isRead: true,
    createdAt: "Yesterday",
    relatedConversationId: 1,
  },
  {
    id: 4,
    title: "Request Completed",
    message: "Your blood donation coordination has been marked completed.",
    type: "request_completed",
    isRead: true,
    createdAt: "2 days ago",
    relatedConversationId: 1,
  },
];

export default function NotificationsScreen() {
  /*
    Notification state.

    Purpose:
    - Temporary local state muna.
    - Later, this will come from backend API.
  */
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(mockNotifications);

  /*
    Counts unread notification items.
  */
  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  /*
    Mark one notification as read.
  */
  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isRead: true,
            }
          : item
      )
    );
  };

  /*
    Mark all notifications as read.
  */
  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
      }))
    );
  };

  /*
    Handles notification click.

    Purpose:
    - Opens the related screen based on notification type.
    - Later, relatedRequestId / relatedConversationId will be used.
  */
  const handleNotificationPress = (item: NotificationItem) => {
    markAsRead(item.id);

    if (item.type === "blood_request") {
      /*
        Donor side:
        Opens request tab where donor can view request details.
        Later, this can open exact request details using request_id.
      */
      router.push("/request");
      return;
    }

    if (
      item.type === "request_accepted" ||
      item.type === "proof_submitted" ||
      item.type === "request_completed"
    ) {
      /*
        Seeker/donor side:
        Opens messages where conversation is available.
        Later, this can open exact conversation using conversation_id.
      */
      router.push("/message");
      return;
    }

    if (item.type === "request_rejected") {
      router.push("/request");
      return;
    }

    Alert.alert("Notification", item.message);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={25} color={RED} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            Request updates and system activity
          </Text>
        </View>
      </View>

      {/* Top action card */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryTitle}>
            {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </Text>

          <Text style={styles.summaryText}>
            Chat messages are shown in the Messages tab, not here.
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.readAllButton}
            activeOpacity={0.85}
            onPress={markAllAsRead}
          >
            <Text style={styles.readAllText}>Read all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-off-outline" size={50} color={RED} />

          <Text style={styles.emptyTitle}>No notifications yet</Text>

          <Text style={styles.emptyText}>
            Important request updates will appear here.
          </Text>
        </View>
      ) : (
        notifications.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            onPress={() => handleNotificationPress(item)}
          />
        ))
      )}
    </ScrollView>
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
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "#FFF1F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTextBox: {
    flex: 1,
  },

  title: {
    color: RED,
    fontSize: 29,
    fontWeight: "900",
  },

  subtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 3,
  },

  summaryCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryTitle: {
    color: "#222",
    fontSize: 16,
    fontWeight: "900",
  },

  summaryText: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
    maxWidth: 230,
  },

  readAllButton: {
    backgroundColor: RED,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginLeft: "auto",
  },

  readAllText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginTop: 25,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: RED,
    marginTop: 12,
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
  },
});