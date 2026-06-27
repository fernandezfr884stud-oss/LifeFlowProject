import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

const RED = "#730000";

/*
  Prototype only.

  Purpose:
  - "seeker" means you are viewing the seeker side.
  - Change to "donor" if you want to preview donor side.
  - Later, this will come from logged-in user data.
*/
const CURRENT_ROLE: "seeker" | "donor" = "seeker";

/*
  Prototype switch.

  Purpose:
  - true = shows sample accepted/completed conversations.
  - false = shows empty message state.
*/
const SHOW_SAMPLE_CONVERSATIONS = true;

/*
  Red Cross destination.

  Purpose:
  - Opens fixed destination only.
  - It does not automatically expose user's current location.
*/
const RED_CROSS_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Philippine+Red+Cross+Dagupan+City+Chapter";

type ChatStatus = "Accepted" | "In Progress" | "For Verification" | "Completed";

type ChatMessage = {
  id: number;
  sender: "seeker" | "donor";
  name: string;
  text: string;
};

type Conversation = {
  id: number;
  requestId: number;
  donorName: string;
  seekerName: string;
  bloodType: string;
  status: ChatStatus;
  lastUpdated: string;
  messages: ChatMessage[];

  /*
    Meet-up agreement.

    Purpose:
    - Map/location sharing should only work once both users agreed.
  */
  currentUserAgreed: boolean;
  otherUserAgreed: boolean;
  shareLocation: boolean;

  /*
    Completion proof.

    Purpose:
    - After donation, both users should submit proof.
    - Once both submitted, conversation can be marked Completed.
  */
  seekerProofSubmitted: boolean;
  donorProofSubmitted: boolean;
};

const sampleConversations: Conversation[] = [
  {
    id: 1,
    requestId: 101,
    donorName: "Steph",
    seekerName: "Chloe",
    bloodType: "O+",
    status: "Accepted",
    lastUpdated: "Today",
    currentUserAgreed: false,
    otherUserAgreed: true,
    shareLocation: false,
    seekerProofSubmitted: false,
    donorProofSubmitted: false,
    messages: [
      {
        id: 1,
        sender: "seeker",
        name: "Chloe",
        text: "Hello, thank you for accepting my request.",
      },
      {
        id: 2,
        sender: "donor",
        name: "Steph",
        text: "No problem. Where should we meet?",
      },
      {
        id: 3,
        sender: "seeker",
        name: "Chloe",
        text: "Red Cross na lang po.",
      },
    ],
  },
  {
    id: 2,
    requestId: 100,
    donorName: "Maria Santos",
    seekerName: "Chloe",
    bloodType: "A+",
    status: "Completed",
    lastUpdated: "Yesterday",
    currentUserAgreed: true,
    otherUserAgreed: true,
    shareLocation: false,
    seekerProofSubmitted: true,
    donorProofSubmitted: true,
    messages: [
      {
        id: 1,
        sender: "seeker",
        name: "Chloe",
        text: "Thank you for helping us.",
      },
      {
        id: 2,
        sender: "donor",
        name: "Maria",
        text: "You are welcome. I already submitted my proof.",
      },
    ],
  },
];

export default function MessageScreen() {
  /*
    FlatList reference.

    Purpose:
    - Used to auto-scroll to the latest message.
  */
  const listRef = useRef<FlatList<ChatMessage>>(null);

  /*
    Conversation list.

    Purpose:
    - Front-end prototype only.
    - Later, this will be fetched from backend where request status is Accepted.
  */
  const [conversations, setConversations] = useState<Conversation[]>(
    SHOW_SAMPLE_CONVERSATIONS ? sampleConversations : []
  );

  /*
    Active conversation state.

    Purpose:
    - If null, show conversation list.
    - If has value, show chat screen.
  */
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null
  );

  /*
    Message input state.
  */
  const [newMessage, setNewMessage] = useState("");

  /*
    Keyboard state.

    Purpose:
    - Helps adjust layout when typing.
  */
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  /*
    Finds the selected conversation.
  */
  const activeConversation =
    conversations.find((item) => item.id === activeConversationId) || null;

  /*
    Keyboard listener.

    Purpose:
    - Detects keyboard open/close.
    - Helps the input move with keyboard.
  */
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /*
    Helper for updating one conversation.

    Purpose:
    - Keeps the conversation update code cleaner.
  */
  const updateConversation = (
    conversationId: number,
    updater: (conversation: Conversation) => Conversation
  ) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation
      )
    );
  };

  /*
    Sends chat message.

    Purpose:
    - Adds message locally for prototype.
    - Later, this will send message to backend/Firebase.
  */
  const sendMessage = () => {
    if (!activeConversation) return;

    if (activeConversation.status === "Completed") {
      Alert.alert(
        "Conversation completed",
        "This conversation is already completed and can only be viewed."
      );
      return;
    }

    const cleanedMessage = newMessage.trim();

    if (!cleanedMessage) return;

    const message: ChatMessage = {
      id: Date.now(),
      sender: CURRENT_ROLE,
      name: CURRENT_ROLE === "seeker" ? activeConversation.seekerName : activeConversation.donorName,
      text: cleanedMessage,
    };

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      messages: [...conversation.messages, message],
      lastUpdated: "Now",
    }));

    setNewMessage("");

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /*
    Handles current user's meet-up agreement.

    Purpose:
    - Once both users agree, status becomes In Progress.
  */
  const toggleAgreement = () => {
    if (!activeConversation) return;

    if (activeConversation.status === "Completed") return;

    updateConversation(activeConversation.id, (conversation) => {
      const newAgreement = !conversation.currentUserAgreed;
      const bothAgreed = newAgreement && conversation.otherUserAgreed;

      return {
        ...conversation,
        currentUserAgreed: newAgreement,
        status: bothAgreed ? "In Progress" : "Accepted",
      };
    });
  };

  /*
    Opens map if both users agreed.
  */
  const openMap = () => {
    if (!activeConversation) return;

    const bothAgreed =
      activeConversation.currentUserAgreed &&
      activeConversation.otherUserAgreed;

    if (!bothAgreed) {
      Alert.alert(
        "Meet-up not confirmed",
        "Map will be available once both users agree."
      );
      return;
    }

    Linking.openURL(RED_CROSS_MAP_URL);
  };

  /*
    Toggles location sharing.

    Purpose:
    - Disabled until both users agreed.
    - Later, this should request real location permission.
  */
  const toggleLocationSharing = () => {
    if (!activeConversation) return;

    const bothAgreed =
      activeConversation.currentUserAgreed &&
      activeConversation.otherUserAgreed;

    if (!bothAgreed) {
      Alert.alert(
        "Location sharing unavailable",
        "Both users must agree before location sharing can be enabled."
      );
      return;
    }

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      shareLocation: !conversation.shareLocation,
    }));
  };

  /*
    Submit donation completion proof.

    Purpose:
    - Current user submits proof after donation.
    - If the other user already submitted proof, status becomes Completed.
    - Later, this will be real upload to backend.
  */
  const submitCompletionProof = () => {
    if (!activeConversation) return;

    if (activeConversation.status === "Completed") {
      Alert.alert("Already completed", "This donation is already completed.");
      return;
    }

    const currentProofSubmitted =
      CURRENT_ROLE === "seeker"
        ? activeConversation.seekerProofSubmitted
        : activeConversation.donorProofSubmitted;

    if (currentProofSubmitted) {
      Alert.alert(
        "Proof already submitted",
        "Please wait for the other user to submit their proof."
      );
      return;
    }

    Alert.alert(
      "Submit Completion Proof?",
      "This is a prototype upload. Later, users will upload proof or document here.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: () => {
            updateConversation(activeConversation.id, (conversation) => {
              const seekerProof =
                CURRENT_ROLE === "seeker"
                  ? true
                  : conversation.seekerProofSubmitted;

              const donorProof =
                CURRENT_ROLE === "donor"
                  ? true
                  : conversation.donorProofSubmitted;

              const completed = seekerProof && donorProof;

              return {
                ...conversation,
                seekerProofSubmitted: seekerProof,
                donorProofSubmitted: donorProof,
                status: completed ? "Completed" : "For Verification",
                lastUpdated: "Now",
              };
            });

            Alert.alert(
              "Proof submitted",
              "Your completion proof has been submitted."
            );
          },
        },
      ]
    );
  };

  /*
    Conversation list screen.
  */
  if (!activeConversation) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Messages"
          subtitle="Accepted requests and completed chats"
        />

        {conversations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={50} color={RED} />

            <Text style={styles.emptyTitle}>No active conversations yet</Text>

            <Text style={styles.emptyText}>
              When a donor accepts your blood request, your conversation will
              appear here.
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              activeOpacity={0.85}
              onPress={() => setActiveConversationId(conversation.id)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {conversation.bloodType}
                </Text>
              </View>

              <View style={styles.conversationInfo}>
                <View style={styles.conversationTop}>
                  <Text style={styles.conversationName}>
                    {CURRENT_ROLE === "seeker"
                      ? conversation.donorName
                      : conversation.seekerName}
                  </Text>

                  <Text style={styles.timeText}>{conversation.lastUpdated}</Text>
                </View>

                <Text style={styles.lastMessage} numberOfLines={1}>
                  {conversation.messages[conversation.messages.length - 1]?.text}
                </Text>

                <StatusBadge status={conversation.status} />
              </View>

              <Ionicons name="chevron-forward" size={21} color={RED} />
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    );
  }

  const bothAgreed =
    activeConversation.currentUserAgreed && activeConversation.otherUserAgreed;

  const currentProofSubmitted =
    CURRENT_ROLE === "seeker"
      ? activeConversation.seekerProofSubmitted
      : activeConversation.donorProofSubmitted;

  const otherProofSubmitted =
    CURRENT_ROLE === "seeker"
      ? activeConversation.donorProofSubmitted
      : activeConversation.seekerProofSubmitted;

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingBottom: keyboardVisible ? 8 : 120,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Chat header */}
      <ChatHeader
        title={
          CURRENT_ROLE === "seeker"
            ? activeConversation.donorName
            : activeConversation.seekerName
        }
        subtitle={`${activeConversation.bloodType} donor request`}
        status={activeConversation.status}
        onBack={() => {
          Keyboard.dismiss();
          setActiveConversationId(null);
          setNewMessage("");
        }}
      />

      <View style={styles.chatCard}>
        {/* Only message list is scrollable */}
        <FlatList
          ref={listRef}
          data={activeConversation.messages}
          keyExtractor={(item) => String(item.id)}
          style={styles.messagesArea}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            listRef.current?.scrollToEnd({ animated: true });
          }}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isCurrentUser={item.sender === CURRENT_ROLE}
            />
          )}
        />

        {/* Controls are hidden for completed conversations */}
        {activeConversation.status !== "Completed" ? (
          <View style={styles.controls}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, !bothAgreed && styles.disabledBtn]}
                activeOpacity={0.85}
                onPress={openMap}
              >
                <Ionicons name="map-outline" size={18} color="#FFFFFF" />
                <Text style={styles.actionText}>View Map</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.darkBtn,
                  activeConversation.currentUserAgreed && styles.greenBtn,
                ]}
                activeOpacity={0.85}
                onPress={toggleAgreement}
              >
                <Ionicons
                  name={
                    activeConversation.currentUserAgreed
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.actionText}>
                  {activeConversation.currentUserAgreed
                    ? `${CURRENT_ROLE === "seeker" ? "Seeker" : "Donor"} agreed`
                    : `Agree as ${CURRENT_ROLE}`}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.locationBtn,
                activeConversation.shareLocation && styles.activeLocationBtn,
                !bothAgreed && styles.disabledLocationBtn,
              ]}
              activeOpacity={0.85}
              onPress={toggleLocationSharing}
            >
              <Ionicons
                name={
                  activeConversation.shareLocation
                    ? "location"
                    : "location-outline"
                }
                size={17}
                color={activeConversation.shareLocation ? "#FFFFFF" : RED}
              />

              <Text
                style={[
                  styles.locationText,
                  activeConversation.shareLocation &&
                    styles.activeLocationText,
                ]}
              >
                {activeConversation.shareLocation
                  ? "Location sharing allowed"
                  : "Allow location sharing"}
              </Text>
            </TouchableOpacity>

            {!bothAgreed && (
              <Text style={styles.mapHint}>
                Map and location sharing will be available once both users agree.
              </Text>
            )}

            {bothAgreed && (
              <VerificationBox
                currentProofSubmitted={currentProofSubmitted}
                otherProofSubmitted={otherProofSubmitted}
                onSubmitProof={submitCompletionProof}
              />
            )}
          </View>
        ) : (
          <View style={styles.completedBox}>
            <Ionicons name="checkmark-circle" size={20} color="#178A3B" />
            <Text style={styles.completedText}>
              Donation completed. This chat is saved as history.
            </Text>
          </View>
        )}

        {/* Message input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={
              activeConversation.status === "Completed"
                ? "Conversation completed"
                : "Message"
            }
            placeholderTextColor="#999"
            value={newMessage}
            onChangeText={setNewMessage}
            editable={activeConversation.status !== "Completed"}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              activeConversation.status === "Completed" && styles.disabledSend,
            ]}
            activeOpacity={0.85}
            onPress={sendMessage}
            disabled={activeConversation.status === "Completed"}
          >
            <Ionicons name="send" size={21} color={RED} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/*
  Chat header.

  Purpose:
  - Used inside the actual chat screen.
  - Has back button to return to conversation list.
*/
function ChatHeader({
  title,
  subtitle,
  status,
  onBack,
}: {
  title: string;
  subtitle: string;
  status: ChatStatus;
  onBack: () => void;
}) {
  return (
    <View style={styles.chatHeader}>
      <TouchableOpacity style={styles.backBtn} activeOpacity={0.85} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color={RED} />
      </TouchableOpacity>

      <View style={styles.chatHeaderText}>
        <Text style={styles.chatTitle}>{title}</Text>
        <Text style={styles.chatSubtitle}>{subtitle}</Text>
      </View>

      <StatusBadge status={status} />
    </View>
  );
}

/*
  Message bubble.

  Purpose:
  - Current user is aligned right.
  - Other user is aligned left.
*/
function MessageBubble({
  message,
  isCurrentUser,
}: {
  message: ChatMessage;
  isCurrentUser: boolean;
}) {
  return (
    <View
      style={[
        styles.messageRow,
        isCurrentUser ? styles.rightRow : styles.leftRow,
      ]}
    >
      {!isCurrentUser && <ChatAvatar label={message.name[0]} />}

      <View
        style={[
          styles.messageBlock,
          isCurrentUser ? styles.rightBlock : styles.leftBlock,
        ]}
      >
        <Text style={styles.senderName}>{message.name}</Text>

        <View
          style={[
            styles.bubble,
            isCurrentUser ? styles.rightBubble : styles.leftBubble,
          ]}
        >
          <Text style={styles.bubbleText}>{message.text}</Text>
        </View>
      </View>

      {isCurrentUser && <ChatAvatar label={message.name[0]} />}
    </View>
  );
}

/*
  Chat avatar.

  Purpose:
  - Temporary chat avatar.
  - Later, backend can provide profile picture.
*/
function ChatAvatar({ label }: { label: string }) {
  return (
    <View style={styles.chatAvatar}>
      <Text style={styles.chatAvatarText}>{label}</Text>
    </View>
  );
}

/*
  Status badge.

  Purpose:
  - Shows conversation status.
*/
function StatusBadge({ status }: { status: ChatStatus }) {
  const colorMap = {
    Accepted: {
      background: "#EAF8EF",
      text: "#178A3B",
    },
    "In Progress": {
      background: "#EAF3FF",
      text: "#2563EB",
    },
    "For Verification": {
      background: "#FFF0C2",
      text: "#A36A00",
    },
    Completed: {
      background: "#EAF8EF",
      text: "#178A3B",
    },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: colorMap.background }]}>
      <Text style={[styles.statusText, { color: colorMap.text }]}>{status}</Text>
    </View>
  );
}

/*
  Verification box.

  Purpose:
  - Shows proof submission status after both users agree.
  - Current user can submit proof.
*/
function VerificationBox({
  currentProofSubmitted,
  otherProofSubmitted,
  onSubmitProof,
}: {
  currentProofSubmitted: boolean;
  otherProofSubmitted: boolean;
  onSubmitProof: () => void;
}) {
  return (
    <View style={styles.verificationBox}>
      <Text style={styles.verificationTitle}>After donation verification</Text>

      <View style={styles.proofRow}>
        <Ionicons
          name={currentProofSubmitted ? "checkmark-circle" : "ellipse-outline"}
          size={17}
          color={currentProofSubmitted ? "#178A3B" : "#777"}
        />
        <Text style={styles.proofText}>
          Your proof: {currentProofSubmitted ? "Submitted" : "Not submitted"}
        </Text>
      </View>

      <View style={styles.proofRow}>
        <Ionicons
          name={otherProofSubmitted ? "checkmark-circle" : "ellipse-outline"}
          size={17}
          color={otherProofSubmitted ? "#178A3B" : "#777"}
        />
        <Text style={styles.proofText}>
          Other user proof: {otherProofSubmitted ? "Submitted" : "Waiting"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.proofButton,
          currentProofSubmitted && styles.disabledProofButton,
        ]}
        activeOpacity={0.85}
        onPress={onSubmitProof}
        disabled={currentProofSubmitted}
      >
        <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
        <Text style={styles.proofButtonText}>
          {currentProofSubmitted ? "PROOF SUBMITTED" : "SUBMIT PROOF"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  /*
    Main screen.
  */
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  listContent: {
    paddingBottom: 120,
  },

  bottomSpace: {
    height: 20,
  },

  /*
    Empty state.
  */
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

  /*
    Conversation list.
  */
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginBottom: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },

  conversationTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  conversationName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#222",
    flex: 1,
  },

  timeText: {
    color: "#999",
    fontSize: 12,
    marginLeft: 8,
  },

  lastMessage: {
    color: "#777",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 7,
  },

  /*
    Chat header.
  */
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: "#FFF1F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  chatHeaderText: {
    flex: 1,
  },

  chatTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: RED,
  },

  chatSubtitle: {
    color: "#777",
    fontSize: 12,
    marginTop: 3,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },

  /*
    Chat card.
  */
  chatCard: {
    flex: 1,
    backgroundColor: "#FFF7F7",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    padding: 14,
  },

  messagesArea: {
    flex: 1,
  },

  messageList: {
    paddingBottom: 8,
  },

  /*
    Messages.
  */
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

  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFC83D",
    justifyContent: "center",
    alignItems: "center",
  },

  chatAvatarText: {
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

  /*
    Meet-up controls.
  */
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

  disabledLocationBtn: {
    opacity: 0.65,
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

  /*
    Verification.
  */
  verificationBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    padding: 12,
    marginTop: 6,
    marginBottom: 6,
  },

  verificationTitle: {
    color: RED,
    fontWeight: "900",
    fontSize: 13,
    marginBottom: 8,
  },

  proofRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  proofText: {
    color: "#666",
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "700",
  },

  proofButton: {
    height: 40,
    borderRadius: 15,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 6,
  },

  disabledProofButton: {
    opacity: 0.65,
  },

  proofButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },

  completedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4FFF7",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D8F5DF",
    marginBottom: 8,
  },

  completedText: {
    flex: 1,
    color: "#178A3B",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },

  /*
    Input.
  */
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

  disabledSend: {
    opacity: 0.4,
  },
});