import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const RED = "#730000";

const genderOptions = ["Male", "Female", "Other"];
const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/*
  Temporary location data for front-end demo.
  Later, backend can provide this list from database/API.
*/
const locationData: Record<string, Record<string, Record<string, string[]>>> = {
  "Ilocos Region": {
    Pangasinan: {
      "Dagupan City": [
        "Bonuan Binloc",
        "Bonuan Boquig",
        "Bonuan Gueset",
        "Pantal",
        "Lucao",
        "Malued",
        "Tapuac",
        "Poblacion Oeste",
      ],
      Calasiao: ["Poblacion", "Banaoang", "Lasip", "Nalsian"],
      Mangaldan: ["Poblacion", "Guesang", "Banaoang", "Guilig"],
      Binmaley: ["Poblacion", "Naguilayan", "Calit", "Biec"],
    },
  },
};

/*
  This is the final register data format.
  Backend partner can follow this structure.
*/
    type RegisterPayload = {
      firstName: string;
      middleInitial: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      gender: string;
      bloodType: string;
      region: string;
      province: string;
      city: string;
      barangay: string;
      password: string;
      acceptedTerms: boolean;
    };

/*
  BACKEND PLACEHOLDER:
  Later, your backend partner will replace this with real API/database request.

  Example later:
  await fetch("https://your-api.com/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
*/
const registerUser = async (payload: RegisterPayload) => {
  console.log("Register payload ready for backend:", payload);

  /*
    Temporary success response for front-end demo.
  */
  return {
    success: true,
  };
};

export default function RegisterScreen() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  /*
    Register form data.
    Later, backend will save these values to database.
  */
        const [form, setForm] = useState({
          firstName: "",
          middleInitial: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          gender: "",
          bloodType: "",
          region: "",
          province: "",
          city: "",
          barangay: "",
          password: "",
          confirmPassword: "",
        });

        /*
          Modal controls.
        */
        const [showGenderModal, setShowGenderModal] = useState(false);
        const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
        const [showLocationModal, setShowLocationModal] = useState(false);

        /*
          Helper for updating one form field.
        */
        const updateForm = (key: keyof typeof form, value: string) => {
          setForm((current) => ({ ...current, [key]: value }));
        };

        const fullName = `${form.firstName} ${form.middleInitial} ${form.lastName}`
          .replace(/\s+/g, " ")
          .trim();

        const locationText =
          form.region && form.province && form.city && form.barangay
            ? `${form.region}, ${form.province}, ${form.city}, ${form.barangay}`
            : "Region, Province, City, Barangay";

        const provinceOptions = form.region
          ? Object.keys(locationData[form.region] || {})
          : [];

        const cityOptions =
          form.region && form.province
            ? Object.keys(locationData[form.region]?.[form.province] || {})
            : [];

        const barangayOptions =
          form.region && form.province && form.city
            ? locationData[form.region]?.[form.province]?.[form.city] || []
            : [];

        /*
          Front-end validation before sending to backend.
          Backend should still validate again later.
        */
      const validateForm = () => {
        if (
          !form.firstName.trim() ||
          !form.lastName.trim() ||
          !form.email.trim() ||
          !form.phoneNumber.trim() ||
          !form.gender ||
          !form.bloodType ||
          !form.region ||
          !form.province ||
          !form.city ||
          !form.barangay ||
          !form.password ||
          !form.confirmPassword
        ) {
          Alert.alert("Missing details", "Please complete all required fields.");
          return false;
        }

        if (!form.email.includes("@")) {
          Alert.alert("Invalid email", "Please enter a valid email address.");
          return false;
        }

        if (form.phoneNumber.length < 10) {
          Alert.alert("Invalid phone number", "Please enter a valid phone number.");
          return false;
        }

        if (form.password.length < 6) {
          Alert.alert("Weak password", "Password must be at least 6 characters.");
          return false;
        }

        if (form.password !== form.confirmPassword) {
          Alert.alert(
            "Password mismatch",
            "Password and confirm password do not match."
          );
          return false;
        }

        if (!acceptedTerms) {
          Alert.alert(
            "Terms and Conditions",
            "Please agree to the Terms and Conditions before signing up."
          );
          return false;
        }

        return true;
      };

      const handleSignUp = async () => {
        if (!validateForm()) return;

        const payload: RegisterPayload = {
          firstName: form.firstName.trim(),
          middleInitial: form.middleInitial.trim().toUpperCase(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phoneNumber: form.phoneNumber.trim(),
          gender: form.gender,
          bloodType: form.bloodType,
          region: form.region,
          province: form.province,
          city: form.city,
          barangay: form.barangay,
          password: form.password,
          acceptedTerms: acceptedTerms,
        };

        try {
          setIsSubmitting(true);

          const response = await registerUser(payload);

          if (!response.success) {
            Alert.alert("Registration failed", "Please try again.");
            return;
          }

        router.replace({
          pathname: "/login",
          params: {
            registered: "true",
            email: payload.email,
          },
        });
        } catch (error) {
          Alert.alert("Something went wrong", "Unable to create account.");
        } finally {
          setIsSubmitting(false);
        }
      };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Register</Text>
        <Text style={styles.description}>Create your LifeFlow account</Text>

        {/* Name fields */}
        <View style={styles.nameRow}>
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#999"
            style={styles.nameInput}
            value={form.firstName}
            onChangeText={(text) => updateForm("firstName", text)}
          />

          <TextInput
            placeholder="M.I."
            placeholderTextColor="#999"
            style={styles.nameInput}
            value={form.middleInitial}
            onChangeText={(text) => updateForm("middleInitial", text)}
            maxLength={2}
            autoCapitalize="characters"
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#999"
            style={styles.nameInput}
            value={form.lastName}
            onChangeText={(text) => updateForm("lastName", text)}
          />
        </View>

        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={form.email}
          onChangeText={(text) => updateForm("email", text)}
        />

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          style={styles.input}
          value={form.phoneNumber}
          onChangeText={(text) => updateForm("phoneNumber", text)}
        />

        <TouchableOpacity
          style={styles.dropdown}
          activeOpacity={0.85}
          onPress={() => setShowGenderModal(true)}
        >
          <Text
            style={[
              styles.dropdownText,
              form.gender && styles.selectedDropdownText,
            ]}
          >
            {form.gender || "Gender ▼"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          activeOpacity={0.85}
          onPress={() => setShowBloodTypeModal(true)}
        >
          <Text
            style={[
              styles.dropdownText,
              form.bloodType && styles.selectedDropdownText,
            ]}
          >
            {form.bloodType || "Blood Type ▼"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          activeOpacity={0.85}
          onPress={() => setShowLocationModal(true)}
        >
          <Text
            style={[
              styles.dropdownText,
              form.region && styles.selectedDropdownText,
            ]}
            numberOfLines={1}
          >
            {locationText}
          </Text>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={form.password}
          onChangeText={(text) => updateForm("password", text)}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={form.confirmPassword}
          onChangeText={(text) => updateForm("confirmPassword", text)}
        />

        {/* Terms and Conditions checkbox */}
        <TouchableOpacity
          style={styles.termsRow}
          activeOpacity={0.85}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkedBox]}>
            {acceptedTerms && <Text style={styles.checkMark}>✓</Text>}
          </View>

          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text style={styles.termsLink}>Terms and Conditions</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.disabledButton]}
          activeOpacity={0.85}
          onPress={handleSignUp}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.bottomText}>Already have an account?</Text>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <OptionModal
        visible={showGenderModal}
        title="Select Gender"
        options={genderOptions}
        selectedValue={form.gender}
        onClose={() => setShowGenderModal(false)}
        onSelect={(value) => {
          updateForm("gender", value);
          setShowGenderModal(false);
        }}
      />

      <OptionModal
        visible={showBloodTypeModal}
        title="Select Blood Type"
        options={bloodTypeOptions}
        selectedValue={form.bloodType}
        onClose={() => setShowBloodTypeModal(false)}
        onSelect={(value) => {
          updateForm("bloodType", value);
          setShowBloodTypeModal(false);
        }}
      />

      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>

              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.locationLabel}>Region</Text>
              <View style={styles.optionWrap}>
                {Object.keys(locationData).map((region) => (
                  <LocationChip
                    key={region}
                    label={region}
                    active={form.region === region}
                    onPress={() => {
                      updateForm("region", region);
                      updateForm("province", "");
                      updateForm("city", "");
                      updateForm("barangay", "");
                    }}
                  />
                ))}
              </View>

              <Text style={styles.locationLabel}>Province</Text>
              <View style={styles.optionWrap}>
                {provinceOptions.length > 0 ? (
                  provinceOptions.map((province) => (
                    <LocationChip
                      key={province}
                      label={province}
                      active={form.province === province}
                      onPress={() => {
                        updateForm("province", province);
                        updateForm("city", "");
                        updateForm("barangay", "");
                      }}
                    />
                  ))
                ) : (
                  <Text style={styles.helperText}>Select region first</Text>
                )}
              </View>

              <Text style={styles.locationLabel}>City / Municipality</Text>
              <View style={styles.optionWrap}>
                {cityOptions.length > 0 ? (
                  cityOptions.map((city) => (
                    <LocationChip
                      key={city}
                      label={city}
                      active={form.city === city}
                      onPress={() => {
                        updateForm("city", city);
                        updateForm("barangay", "");
                      }}
                    />
                  ))
                ) : (
                  <Text style={styles.helperText}>Select province first</Text>
                )}
              </View>

              <Text style={styles.locationLabel}>Barangay</Text>
              <View style={styles.optionWrap}>
                {barangayOptions.length > 0 ? (
                  barangayOptions.map((barangay) => (
                    <LocationChip
                      key={barangay}
                      label={barangay}
                      active={form.barangay === barangay}
                      onPress={() => updateForm("barangay", barangay)}
                    />
                  ))
                ) : (
                  <Text style={styles.helperText}>Select city first</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={0.85}
                onPress={() => {
                  if (
                    !form.region ||
                    !form.province ||
                    !form.city ||
                    !form.barangay
                  ) {
                    Alert.alert(
                      "Incomplete location",
                      "Please select region, province, city, and barangay."
                    );
                    return;
                  }

                  setShowLocationModal(false);
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/*
  Reusable modal.
  Later pwede ilipat sa components/OptionModal.tsx
*/
function OptionModal({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.optionModalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionItem,
                selectedValue === option && styles.activeOptionItem,
              ]}
              activeOpacity={0.85}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedValue === option && styles.activeOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

/*
  Reusable location chip.
  Later pwede ilipat sa components/LocationChip.tsx
*/
function LocationChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.locationChip, active && styles.activeLocationChip]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text
        style={[
          styles.locationChipText,
          active && styles.activeLocationChipText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    padding: 25,
    paddingBottom: 55,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    marginTop: 50,
    color: "#222",
  },

  description: {
    color: "#777",
    marginBottom: 25,
  },

  nameRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  nameInput: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 15,
    color: "#333",
  },

  input: {
    backgroundColor: "#F1F1F1",
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 20,
    marginBottom: 12,
    color: "#333",
  },

  dropdown: {
    backgroundColor: "#F1F1F1",
    height: 55,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  dropdownText: {
    color: "#999",
    fontSize: 15,
    flex: 1,
  },

  selectedDropdownText: {
    color: "#333",
    fontWeight: "600",
  },

  arrow: {
    color: "#999",
    fontSize: 22,
    marginLeft: 10,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  checkedBox: {
    backgroundColor: RED,
  },

  checkMark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  termsText: {
    flex: 1,
    color: "#666",
    fontSize: 13,
    lineHeight: 18,
  },

  termsLink: {
    color: RED,
    fontWeight: "900",
  },

  button: {
    backgroundColor: RED,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50,
  },

  bottomText: {
    color: "#666",
    fontSize: 15,
  },

  link: {
    color: RED,
    fontWeight: "900",
    marginLeft: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 25,
  },

  optionModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 20,
  },

  locationModalCard: {
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: RED,
  },

  closeText: {
    color: RED,
    fontWeight: "900",
  },

  optionItem: {
    height: 48,
    borderRadius: 18,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  activeOptionItem: {
    backgroundColor: RED,
  },

  optionText: {
    color: "#333",
    fontWeight: "700",
  },

  activeOptionText: {
    color: "#FFFFFF",
  },

  locationLabel: {
    color: RED,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 6,
  },

  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  locationChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    marginRight: 8,
    marginBottom: 8,
  },

  activeLocationChip: {
    backgroundColor: RED,
    borderColor: RED,
  },

  locationChipText: {
    color: RED,
    fontSize: 13,
    fontWeight: "800",
  },

  activeLocationChipText: {
    color: "#FFFFFF",
  },

  helperText: {
    color: "#999",
    fontSize: 13,
    marginBottom: 8,
  },

  doneButton: {
    backgroundColor: RED,
    height: 52,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },

  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});