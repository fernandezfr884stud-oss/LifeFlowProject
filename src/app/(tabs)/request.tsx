import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

const RED = "#730000";

const urgencyLevels = ["Low", "Moderate", "Urgent", "Emergency"];

/*
  Blood request status.

  Purpose:
  - Pending means waiting for donor response.
  - Accepted/Rejected will be updated by backend later.
*/
type RequestStatus = "Pending" | "Accepted" | "Rejected";

/*
  This is the submitted request shown in the Request tab.

  Purpose:
  - Front-end display muna.
  - Later, this will come from backend/database.
*/
type BloodRequest = {
  id: number;
  donorName: string;
  patientName: string;
  contactNumber: string;
  location: string;
  bloodTypeNeeded: string;
  urgencyLevel: string;
  reason: string;
  hospitalName: string;
  status: RequestStatus;
};

/*
  Backend-ready request payload.

  Purpose:
  - Ito yung structure na ipapasa sa backend later.
  - Backend partner can follow this format.
*/
type RequestPayload = {
  donorName: string;
  patientName: string;
  contactNumber: string;
  location: string;
  bloodTypeNeeded: string;
  urgencyLevel: string;
  reason: string;
  hospitalName: string;
  proofUploaded: boolean;
  documentUploaded: boolean;
};

/*
  Backend placeholder.

  Purpose:
  - Ready-to-connect function.
  - Later, papalitan ito ng real API call using fetch/axios.
*/
const submitBloodRequestToBackend = async (payload: RequestPayload) => {
  console.log("Blood request payload ready for backend:", payload);

  /*
    Temporary success response for front-end demo.
  */
  return {
    success: true,
  };
};

export default function RequestScreen() {
  /*
    Params from Find Donor.

    Purpose:
    - If user clicks REQUEST from Find Donor,
      the selected donor details will be passed here.
  */
  const params = useLocalSearchParams<{
    requestKey?: string;
    donorName?: string;
    bloodType?: string;
    location?: string;
  }>();

  /*
    Request list state.

    Purpose:
    - Stores submitted requests in front-end only.
    - Later, this will be fetched from backend.
  */
  const [submittedRequests, setSubmittedRequests] = useState<BloodRequest[]>([]);

  /*
    Form visibility state.

    Purpose:
    - If false, show "No requests yet" or request cards.
    - If true, show request form.
  */
  const [showForm, setShowForm] = useState(false);

  /*
    Submit loading state.

    Purpose:
    - Prevents repeated submit clicks.
    - Shows loading spinner while submitting.
  */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
    Prevents the same request params from reopening the form again
    after the user already submitted or cancelled.
  */
  const lastRequestKey = useRef("");

  /*
    Request form state.

    Purpose:
    - Stores the seeker/patient request details.
  */
  const [form, setForm] = useState({
    patientName: "",
    contactNumber: "",
    location: "",
    bloodTypeNeeded: "",
    urgencyLevel: "",
    reason: "",
    hospitalName: "",
  });

  /*
    Temporary upload states.

    Purpose:
    - Front-end placeholder muna.
    - Later, backend partner can connect real file upload.
  */
  const [proofUploaded, setProofUploaded] = useState(false);
  const [documentUploaded, setDocumentUploaded] = useState(false);

  /*
    Opens the request form when coming from Find Donor.

    Important:
    - Blood type is fixed from selected donor.
    - Location is empty because seeker/patient should fill it.
  */
  useEffect(() => {
    const key = String(params.requestKey || params.donorName || "");

    if (key && key !== lastRequestKey.current) {
      lastRequestKey.current = key;
      setShowForm(true);

      setForm((current) => ({
        ...current,
        bloodTypeNeeded: String(params.bloodType || ""),
        location: "",
      }));
    }
  }, [params.requestKey, params.donorName, params.bloodType]);

  /*
    Helper function for updating one form field.
  */
  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  /*
    Reset form after submit or cancel.
  */
  const resetForm = () => {
    setForm({
      patientName: "",
      contactNumber: "",
      location: "",
      bloodTypeNeeded: "",
      urgencyLevel: "",
      reason: "",
      hospitalName: "",
    });

    setProofUploaded(false);
    setDocumentUploaded(false);
  };

  /*
    Front-end validation.

    Purpose:
    - Prevents empty/invalid request before sending to backend.
    - Backend should still validate again later.
  */
  const validateRequest = () => {
    if (
      !form.patientName.trim() ||
      !form.contactNumber.trim() ||
      !form.location.trim() ||
      !form.bloodTypeNeeded.trim() ||
      !form.urgencyLevel ||
      !form.reason.trim() ||
      !form.hospitalName.trim()
    ) {
      Alert.alert("Missing details", "Please complete all required fields.");
      return false;
    }

    if (form.contactNumber.trim().length < 10) {
      Alert.alert("Invalid contact number", "Please enter a valid contact number.");
      return false;
    }

    if (!proofUploaded || !documentUploaded) {
      Alert.alert(
        "Missing proof",
        "Please upload the hospital proof and supporting document."
      );
      return false;
    }

    return true;
  };

  /*
    Submit request.

    Purpose:
    - Validate form.
    - Ask confirmation.
    - Build backend-ready payload.
    - Add request as Pending in request list.
  */
  const submitRequest = () => {
    if (!validateRequest()) return;

    Keyboard.dismiss();

    Alert.alert(
      "Submit Blood Request?",
      "Are you sure you want to submit this blood request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: async () => {
            const payload: RequestPayload = {
              donorName: String(params.donorName || "Selected Donor"),
              patientName: form.patientName.trim(),
              contactNumber: form.contactNumber.trim(),
              location: form.location.trim(),
              bloodTypeNeeded: form.bloodTypeNeeded.trim().toUpperCase(),
              urgencyLevel: form.urgencyLevel,
              reason: form.reason.trim(),
              hospitalName: form.hospitalName.trim(),
              proofUploaded,
              documentUploaded,
            };

            try {
              setIsSubmitting(true);

              const response = await submitBloodRequestToBackend(payload);

              if (!response.success) {
                Alert.alert("Failed", "Unable to submit request.");
                return;
              }

              /*
                Add locally for front-end demo.
                Later, request list should refresh from backend.
              */
              const newRequest: BloodRequest = {
                id: Date.now(),
                donorName: payload.donorName,
                patientName: payload.patientName,
                contactNumber: payload.contactNumber,
                location: payload.location,
                bloodTypeNeeded: payload.bloodTypeNeeded,
                urgencyLevel: payload.urgencyLevel,
                reason: payload.reason,
                hospitalName: payload.hospitalName,
                status: "Pending",
              };

              setSubmittedRequests((current) => [newRequest, ...current]);

              resetForm();
              setShowForm(false);

              Alert.alert("Request Submitted", "Your request is now pending.");
            } catch (error) {
              Alert.alert("Something went wrong", "Unable to submit request.");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Reusable header */}
      <ScreenHeader
        title="Requests"
        subtitle="Track your blood request status here"
      />

      {showForm ? (
        /*
          Form view.
          This appears after user clicks REQUEST from Find Donor.
        */
        <View>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Blood Request Form</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Selected donor details */}
          {params.donorName && (
            <View style={styles.donorBox}>
              <Text style={styles.boxLabel}>Selected Donor</Text>
              <Text style={styles.donorName}>{params.donorName}</Text>
              <Text style={styles.boxText}>Blood Type: {params.bloodType}</Text>
              <Text style={styles.boxText}>Donor Location: {params.location}</Text>
            </View>
          )}

          {/* Patient details */}
          <Text style={styles.sectionTitle}>Patient Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Patient name"
            placeholderTextColor="#999"
            value={form.patientName}
            onChangeText={(text) => updateForm("patientName", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Contact number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={form.contactNumber}
            onChangeText={(text) => updateForm("contactNumber", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Patient / hospital location"
            placeholderTextColor="#999"
            value={form.location}
            onChangeText={(text) => updateForm("location", text)}
          />

          {/* Fixed blood type from selected donor */}
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Blood type needed"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            value={form.bloodTypeNeeded}
            editable={false}
          />

          {/* Urgency level */}
          <Text style={styles.sectionTitle}>Urgency Level</Text>

          <View style={styles.chipContainer}>
            {urgencyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyChip,
                  form.urgencyLevel === level && styles.activeChip,
                ]}
                activeOpacity={0.85}
                onPress={() => updateForm("urgencyLevel", level)}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    form.urgencyLevel === level && styles.activeChipText,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hospital details */}
          <Text style={styles.sectionTitle}>Hospital Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Hospital name"
            placeholderTextColor="#999"
            value={form.hospitalName}
            onChangeText={(text) => updateForm("hospitalName", text)}
          />

          <TextInput
            style={styles.bigInput}
            placeholder="Diagnosis / reason for blood request"
            placeholderTextColor="#999"
            multiline
            value={form.reason}
            onChangeText={(text) => updateForm("reason", text)}
          />

          {/* Proof upload placeholders */}
          <Text style={styles.sectionTitle}>Proof Documents</Text>

          <UploadBox
            uploaded={proofUploaded}
            icon={proofUploaded ? "checkmark-circle" : "cloud-upload-outline"}
            title="Doctor / hospital request proof"
            subtitle={proofUploaded ? "Proof uploaded" : "Tap to upload proof"}
            onPress={() => setProofUploaded(true)}
          />

          <UploadBox
            uploaded={documentUploaded}
            icon={documentUploaded ? "checkmark-circle" : "document-attach-outline"}
            title="Supporting document"
            subtitle="Valid ID, hospital document, official receipt, or blood request slip"
            onPress={() => setDocumentUploaded(true)}
          />

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.disabledButton]}
            activeOpacity={0.85}
            onPress={submitRequest}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={19} color="#FFFFFF" />
                <Text style={styles.submitText}>SUBMIT REQUEST</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /*
          Request list view.
          This appears when user opens Request tab normally.
        */
        <View>
          {submittedRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={48} color={RED} />

              <Text style={styles.emptyTitle}>No requests yet</Text>

              <Text style={styles.emptyText}>
                When you request a blood donor, your pending requests will appear
                here.
              </Text>
            </View>
          ) : (
            submittedRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <View style={styles.requestTitleBox}>
                    <Text style={styles.requestTitle}>
                      {request.bloodTypeNeeded} Blood Request
                    </Text>

                    <Text style={styles.requestSub}>
                      Donor: {request.donorName}
                    </Text>
                  </View>

                  <RequestStatusBadge status={request.status} />
                </View>

                <DetailItem
                  icon="person-outline"
                  text={`Patient: ${request.patientName}`}
                />

                <DetailItem
                  icon="business-outline"
                  text={`Hospital: ${request.hospitalName}`}
                />

                <DetailItem icon="location-outline" text={request.location} />

                <DetailItem
                  icon="alert-circle-outline"
                  text={`Urgency: ${request.urgencyLevel}`}
                />

                <Text style={styles.pendingNote}>
                  Waiting for donor response.
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

/*
  Local reusable UploadBox.

  Purpose:
  - Used for proof document upload UI.
  - Later, this can be connected to real file upload.
*/
function UploadBox({
  uploaded,
  icon,
  title,
  subtitle,
  onPress,
}: {
  uploaded: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.85} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={uploaded ? "#178A3B" : RED}
      />

      <View style={styles.uploadTextBox}>
        <Text style={styles.uploadTitle}>{title}</Text>
        <Text style={styles.uploadSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

/*
  Local reusable request status badge.

  Purpose:
  - Shows Pending / Accepted / Rejected status.
  - Later, can be moved to components if used in other screens.
*/
function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const statusStyle = {
    Pending: {
      bg: "#FFF0C2",
      text: "#A36A00",
    },
    Accepted: {
      bg: "#EAF8EF",
      text: "#178A3B",
    },
    Rejected: {
      bg: "#FFECEC",
      text: "#B00000",
    },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
      <Text style={[styles.statusText, { color: statusStyle.text }]}>
        {status}
      </Text>
    </View>
  );
}

/*
  Local reusable detail item.

  Purpose:
  - Keeps request card details cleaner.
*/
function DetailItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color="#777" />
      <Text style={styles.detailText}>{text}</Text>
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
    paddingBottom: 140,
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cancelText: {
    color: RED,
    fontWeight: "900",
  },

  donorBox: {
    backgroundColor: "#FFF7F7",
    borderRadius: 20,
    padding: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFE1E1",
  },

  boxLabel: {
    color: RED,
    fontWeight: "900",
    marginBottom: 5,
  },

  donorName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#222",
  },

  boxText: {
    color: "#666",
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: RED,
    marginBottom: 10,
    marginTop: 5,
  },

  input: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },

  disabledInput: {
    backgroundColor: "#EFEFEF",
    color: "#777",
  },

  bigInput: {
    height: 115,
    borderRadius: 18,
    backgroundColor: "#F4F4F4",
    padding: 15,
    fontSize: 15,
    color: "#333",
    marginBottom: 16,
    textAlignVertical: "top",
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  urgencyChip: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    marginRight: 7,
    marginBottom: 8,
  },

  activeChip: {
    backgroundColor: RED,
    borderColor: RED,
  },

  urgencyText: {
    color: RED,
    fontSize: 13,
    fontWeight: "800",
  },

  activeChipText: {
    color: "#FFFFFF",
  },

  uploadBox: {
    minHeight: 72,
    borderRadius: 20,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFE1E1",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 12,
  },

  uploadTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  uploadTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#222",
  },

  uploadSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    lineHeight: 17,
  },

    submitBtn: {
      height: 54,
      borderRadius: 22,
      backgroundColor: RED,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      marginTop: 6,
      marginBottom: 8,
    },

  disabledButton: {
    opacity: 0.7,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 8,
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

  requestCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginBottom: 13,
  },

  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  requestTitleBox: {
    flex: 1,
    paddingRight: 10,
  },

  requestTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#222",
  },

  requestSub: {
    color: "#777",
    marginTop: 4,
    fontSize: 13,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignSelf: "flex-start",
  },

  statusText: {
    fontWeight: "900",
    fontSize: 12,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  detailText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 13,
    flex: 1,
  },

  pendingNote: {
    marginTop: 12,
    color: RED,
    fontWeight: "800",
    fontSize: 13,
  },
});