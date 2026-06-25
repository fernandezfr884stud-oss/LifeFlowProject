import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RED = "#730000";

// Change this to "donor" if gusto mo makita donor side sa prototype.
const CURRENT_ROLE: "seeker" | "donor" = "seeker";

// For prototype only. Later, this will come from backend.
const HAS_ACCEPTED_REQUEST = true;

// For prototype only. Later, this will be the real agreement status of the other user.
const OTHER_USER_AGREED = true;

type Message = {
  id: number;
  sender: "seeker" | "donor";
  name: string;
  text: string;
};

const initialMessages: Message[] = [
  { id: 1, sender: "seeker", name: "Chloe", text: "Hello, thank you for accepting my request." },
  { id: 2, sender: "donor", name: "Steph", text: "No problem. Where should we meet?" },
  { id: 3, sender: "seeker", name: "Chloe", text: "Red Cross na lang po." },
  { id: 4, sender: "donor", name: "Steph", text: "Okay, I will check the map." },
];

export default function MessageScreen() {
  const listRef = useRef<FlatList<Message>>(null);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const [showAcceptedPopup, setShowAcceptedPopup] = useState(true);

  const bothAgreed = hasAgreed && OTHER_USER_AGREED;
  const roleLabel = CURRENT_ROLE === "seeker" ? "Seeker" : "Donor";

  // Fixed Red Cross destination only. It does not show user current location.
  const redCrossMapUrl =
    "https://www.google.com/maps/search/?api=1&query=Philippine+Red+Cross+Dagupan+City+Chapter";

  // Request Accepted popup will disappear after 4 seconds.
  // Request Accepted popup will disappear after 4 seconds.
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowAcceptedPopup(false);
      }, 4000);

      return () => clearTimeout(timer);
    }, []);

    // Detects if keyboard is open or closed.
    // Ginagamit ito para tanggalin yung extra bottom padding kapag nagta-type.
    useEffect(() => {
      const showSub = Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardVisible(true);
      });

      const hideSub = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardVisible(false);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: CURRENT_ROLE,
        name: CURRENT_ROLE === "seeker" ? "Chloe" : "Steph",
        text,
      },
    ]);

    setNewMessage("");

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const openMap = () => {
    if (!bothAgreed) return;
    Linking.openURL(redCrossMapUrl);
  };

  if (!HAS_ACCEPTED_REQUEST) {
    return (
      <View style={styles.container}>
        <Header />

        <View style={styles.emptyCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={50} color={RED} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>
            When a donor accepts your request, your conversation will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
      <KeyboardAvoidingView
        style={[
          styles.container,
          keyboardVisible && styles.containerKeyboardOpen,
        ]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <Header />

      {showAcceptedPopup && (
        <View style={styles.popup}>
          <Ionicons name="checkmark-circle" size={22} color="#178A3B" />

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.popupTitle}>Request Accepted</Text>
            <Text style={styles.popupText}>You can now start a conversation.</Text>
          </View>
        </View>
      )}

      <View style={styles.chatCard}>
        {/* Only this chat list is scrollable */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isCurrentUser = item.sender === CURRENT_ROLE;

            return (
              <View
                style={[
                  styles.messageRow,
                  isCurrentUser ? styles.rightRow : styles.leftRow,
                ]}
              >
                {!isCurrentUser && <Avatar label={item.name[0]} />}

                <View
                  style={[
                    styles.messageBlock,
                    isCurrentUser ? styles.rightBlock : styles.leftBlock,
                  ]}
                >
                  <Text style={styles.senderName}>{item.name}</Text>

                  <View
                    style={[
                      styles.bubble,
                      isCurrentUser ? styles.rightBubble : styles.leftBubble,
                    ]}
                  >
                    <Text style={styles.bubbleText}>{item.text}</Text>
                  </View>
                </View>

                {isCurrentUser && <Avatar label={item.name[0]} />}
              </View>
            );
          }}
        />

        {/* Fixed controls below the scrollable chat */}
        <View style={styles.controls}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, !bothAgreed && styles.disabledBtn]}
              onPress={openMap}
            >
              <Ionicons name="map-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionText}>View Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.darkBtn, hasAgreed && styles.greenBtn]}
              onPress={() => setHasAgreed(!hasAgreed)}
            >
              <Ionicons
                name={hasAgreed ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.actionText}>
                {hasAgreed ? `${roleLabel} agreed` : `Agree as ${CURRENT_ROLE}`}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.locationBtn, shareLocation && styles.activeLocationBtn]}
            onPress={() => setShareLocation(!shareLocation)}
          >
            <Ionicons
              name={shareLocation ? "location" : "location-outline"}
              size={17}
              color={shareLocation ? "#FFFFFF" : RED}
            />
            <Text
              style={[
                styles.locationText,
                shareLocation && styles.activeLocationText,
              ]}
            >
              {shareLocation ? "Location sharing allowed" : "Allow location sharing"}
            </Text>
          </TouchableOpacity>

          {!bothAgreed && (
            <Text style={styles.mapHint}>
              Map will be available once both users agree.
            </Text>
          )}
        </View>

        {/* Fixed message input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#999"
            value={newMessage}
            onChangeText={setNewMessage}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={21} color={RED} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Chat with accepted donors</Text>
      </View>

      <TouchableOpacity style={styles.notifBtn}>
        <Ionicons name="notifications-outline" size={24} color={RED} />
        <View style={styles.notifDot} />
      </TouchableOpacity>
    </View>
  );
}

function Avatar({ label }: { label: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: RED,
  },

  subtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
  },

  notifBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  notifDot: {
    position: "absolute",
    top: 13,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E60000",
  },
  
  containerKeyboardOpen: {
  paddingBottom: 0,
  },

  popup: {
    position: "absolute",
    top: 105,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4FFF7",
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: "#D8F5DF",
    elevation: 5,
  },

  popupTitle: {
    color: "#178A3B",
    fontWeight: "900",
    fontSize: 15,
  },

  popupText: {
    color: "#555",
    marginTop: 2,
    fontSize: 12,
  },

  chatCard: {
    flex: 1,
    backgroundColor: "#FFF7F7",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    padding: 14,
  },

  messageList: {
    paddingBottom: 8,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },

  leftRow: {
    justifyContent: "flex-start",
  },

  rightRow: {
    justifyContent: "flex-end",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFC83D",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: RED,
    fontWeight: "900",
  },

  messageBlock: {
    maxWidth: "72%",
  },

  leftBlock: {
    marginLeft: 8,
  },

  rightBlock: {
    marginRight: 8,
    alignItems: "flex-end",
  },

  senderName: {
    color: "#777",
    fontSize: 12,
    marginBottom: 3,
  },

  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },

  leftBubble: {
    backgroundColor: "#3B1F1F",
    borderTopLeftRadius: 6,
  },

  rightBubble: {
    backgroundColor: RED,
    borderTopRightRadius: 6,
  },

  bubbleText: {
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 19,
  },

  controls: {
    borderTopWidth: 1,
    borderColor: "#FFE1E1",
    paddingTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 16,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 8,
  },

  darkBtn: {
    flex: 1,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#3B1F1F",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  greenBtn: {
    backgroundColor: "#178A3B",
  },

  disabledBtn: {
    opacity: 0.45,
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    marginLeft: 6,
  },

  locationBtn: {
    height: 40,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 5,
  },

  activeLocationBtn: {
    backgroundColor: RED,
    borderColor: RED,
  },

  locationText: {
    color: RED,
    fontWeight: "800",
    fontSize: 12,
    marginLeft: 6,
  },

  activeLocationText: {
    color: "#FFFFFF",
  },

  mapHint: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 6,
  },

  inputRow: {
    height: 48,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE1E1",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 6,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginTop: 20,
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