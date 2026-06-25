import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RED = "#730000";

const urgencyLevels = ["Low", "Moderate", "Urgent", "Emergency"];

/*
  This is the type for a submitted blood request.
  For now, this is front-end only.
  Later, this will come from the backend/database.
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
  status: "Pending" | "Accepted" | "Rejected";
};

export default function RequestScreen() {
  /*
    These params come from Find Donor after clicking REQUEST.
  */
  const params = useLocalSearchParams<{
    requestKey?: string;
    donorName?: string;
    bloodType?: string;
    location?: string;
  }>();

  /*
    submittedRequests stores the request cards shown in the Request tab.
    showForm controls if the form should appear.
  */
  const [submittedRequests, setSubmittedRequests] = useState<BloodRequest[]>([]);
  const [showForm, setShowForm] = useState(false);

  /*
    This prevents the form from reopening again after submitting
    while the same route params are still present.
  */
  const lastRequestKey = useRef("");

  /*
    Request form data.
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
    These are only UI placeholders for now.
    Later, your backend partner can connect real upload.
  */
  const [proofUploaded, setProofUploaded] = useState(false);
  const [documentUploaded, setDocumentUploaded] = useState(false);

  /*
    When user comes from Find Donor, open the form automatically
    and auto-fill blood type/location.
  */
    useEffect(() => {
    const key = String(params.requestKey || params.donorName || "");

    if (key && key !== lastRequestKey.current) {
      lastRequestKey.current = key;

      setShowForm(true);

      /*
        Blood type is auto-filled from the selected donor.
        Location is left empty because the seeker/patient should fill it out.
      */
      setForm((current) => ({
        ...current,
        bloodTypeNeeded: String(params.bloodType || ""),
        location: "",
      }));
    }
  }, [params.requestKey, params.donorName, params.bloodType]);

  /*
    Helper function para hindi paulit-ulit ang setForm.
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
    Submit request.
    This will validate the form, ask confirmation,
    then add the request to the pending list.
  */
  const submitRequest = () => {
    const isComplete =
      form.patientName.trim() &&
      form.contactNumber.trim() &&
      form.location.trim() &&
      form.bloodTypeNeeded.trim() &&
      form.urgencyLevel &&
      form.reason.trim() &&
      form.hospitalName.trim();

    if (!isComplete) {
      Alert.alert("Missing details", "Please complete all required fields.");
      return;
    }

    if (!proofUploaded || !documentUploaded) {
      Alert.alert(
        "Missing proof",
        "Please upload the hospital proof and supporting document."
      );
      return;
    }

    Keyboard.dismiss();

    Alert.alert(
      "Submit Blood Request?",
      "Are you sure you want to submit this blood request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: () => {
            const newRequest: BloodRequest = {
              id: Date.now(),
              donorName: String(params.donorName || "Selected Donor"),
              patientName: form.patientName.trim(),
              contactNumber: form.contactNumber.trim(),
              location: form.location.trim(),
              bloodTypeNeeded: form.bloodTypeNeeded.trim().toUpperCase(),
              urgencyLevel: form.urgencyLevel,
              reason: form.reason.trim(),
              hospitalName: form.hospitalName.trim(),
              status: "Pending",
            };

            /*
              Add new request on top of the request list.
            */
            setSubmittedRequests((current) => [newRequest, ...current]);

            resetForm();
            setShowForm(false);

            Alert.alert(
              "Request Submitted",
              "Your request is now pending."
            );
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
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Requests</Text>
          <Text style={styles.subtitle}>
            Track your blood request status here.
          </Text>
        </View>

        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={RED} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* FORM VIEW: appears only after clicking Request from Find Donor */}
      {showForm ? (
        <View>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Blood Request Form</Text>

            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {params.donorName && (
            <View style={styles.donorBox}>
              <Text style={styles.boxLabel}>Selected Donor</Text>
              <Text style={styles.donorName}>{params.donorName}</Text>
              <Text style={styles.boxText}>Blood Type: {params.bloodType}</Text>
              <Text style={styles.boxText}>Location: {params.location}</Text>
            </View>
          )}

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

          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Blood type needed"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            value={form.bloodTypeNeeded}
            editable={false}
          />

          <Text style={styles.sectionTitle}>Urgency Level</Text>

          <View style={styles.chipContainer}>
            {urgencyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyChip,
                  form.urgencyLevel === level && styles.activeChip,
                ]}
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

          <Text style={styles.sectionTitle}>Proof Documents</Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => setProofUploaded(true)}
          >
            <Ionicons
              name={proofUploaded ? "checkmark-circle" : "cloud-upload-outline"}
              size={24}
              color={proofUploaded ? "#178A3B" : RED}
            />

            <View style={styles.uploadTextBox}>
              <Text style={styles.uploadTitle}>
                Doctor / hospital request proof
              </Text>
              <Text style={styles.uploadSubtitle}>
                {proofUploaded ? "Proof uploaded" : "Tap to upload proof"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => setDocumentUploaded(true)}
          >
            <Ionicons
              name={
                documentUploaded
                  ? "checkmark-circle"
                  : "document-attach-outline"
              }
              size={24}
              color={documentUploaded ? "#178A3B" : RED}
            />

            <View style={styles.uploadTextBox}>
              <Text style={styles.uploadTitle}>Supporting document</Text>
              <Text style={styles.uploadSubtitle}>
                Valid ID, hospital document, official receipt, or blood request
                slip
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={submitRequest}>
            <Ionicons name="send" size={19} color="#FFFFFF" />
            <Text style={styles.submitText}>SUBMIT REQUEST</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /*
          REQUEST LIST VIEW:
          This is what appears when user opens the Request tab normally.
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
                  <View>
                    <Text style={styles.requestTitle}>
                      {request.bloodTypeNeeded} Blood Request
                    </Text>
                    <Text style={styles.requestSub}>
                      Donor: {request.donorName}
                    </Text>
                  </View>

                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>{request.status}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#777" />
                  <Text style={styles.detailText}>
                    Patient: {request.patientName}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="business-outline" size={16} color="#777" />
                  <Text style={styles.detailText}>
                    Hospital: {request.hospitalName}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#777" />
                  <Text style={styles.detailText}>{request.location}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="alert-circle-outline" size={16} color="#777" />
                  <Text style={styles.detailText}>
                    Urgency: {request.urgencyLevel}
                  </Text>
                </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  disabledInput: {
    backgroundColor: "#EFEFEF",
    color: "#777",
  },

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,

    /*
      Extra bottom padding para hindi matakpan ng bottom navigation.
    */
    paddingBottom: 140,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: RED,
  },

  subtitle: {
    color: "#777",
    marginTop: 5,
    lineHeight: 20,
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
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
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
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    marginRight: 8,
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
    marginTop: 8,
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

  pendingBadge: {
    backgroundColor: "#FFF0C2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignSelf: "flex-start",
  },

  pendingText: {
    color: "#A36A00",
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