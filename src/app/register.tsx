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
import PasswordField from "../components/PasswordField";

const RED = "#730000";

const genderOptions = ["Male", "Female", "Other"];
const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/*
  Temporary location data.

  Purpose:
  - Front-end demo muna habang wala pang backend.
  - Later, backend can provide full location list from database/API.
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
  Backend-ready register payload.

  Purpose:
  - Ito yung data format na ipapasa sa backend later.
  - Backend partner can follow this structure.
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
  Backend placeholder.

  Purpose:
  - Ready-to-connect function.
  - Later, papalitan ito ng real API call using fetch or axios.
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

  /*
    Loading state.

    Purpose:
    - Prevents repeated Sign Up clicks.
    - Shows loading spinner while submitting.
  */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
    Terms checkbox state.

    Purpose:
    - User must agree before registration.
  */
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  /*
    Terms modal state.

    Purpose:
    - Opens/closes the Terms and Conditions popup.
  */
  const [showTermsModal, setShowTermsModal] = useState(false);

  /*
    Password visibility states.

    Purpose:
    - Controls eye icon show/hide password.
  */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /*
    Register form state.

    Purpose:
    - Stores all user inputs before sending to backend.
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
    Modal states.

    Purpose:
    - Controls Gender, Blood Type, and Location modals.
  */
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  /*
    Helper function.

    Purpose:
    - Updates one form field without repeating setForm code.
  */
  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  /*
    Full name.

    Purpose:
    - Combines first name, middle initial, and last name.
  */
  const fullName = `${form.firstName} ${form.middleInitial} ${form.lastName}`
    .replace(/\s+/g, " ")
    .trim();

  /*
    Location display text.

    Purpose:
    - Shows selected location inside location field.
  */
  const locationText =
    form.region && form.province && form.city && form.barangay
      ? `${form.region}, ${form.province}, ${form.city}, ${form.barangay}`
      : "Region, Province, City, Barangay";

  /*
    Cascading location options.

    Purpose:
    - Province depends on selected region.
    - City depends on selected province.
    - Barangay depends on selected city.
  */
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
    Front-end validation.

    Purpose:
    - Prevents empty/invalid input before sending data to backend.
    - Backend should still validate again later.
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

  /*
    Sign up function.

    Purpose:
    - Validates form.
    - Builds backend-ready payload.
    - Calls registerUser placeholder.
    - Redirects user to Login after successful registration.
  */
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
      acceptedTerms,
    };

    try {
      setIsSubmitting(true);

      const response = await registerUser(payload);

      if (!response.success) {
        Alert.alert("Registration failed", "Please try again.");
        return;
      }

      /*
        After registration, user goes to login.

        Note:
        - Later, backend will save user data.
        - Login will fetch the saved user profile after successful login.
      */
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
        {/* Page title */}
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

        {/* Email field */}
        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={form.email}
          onChangeText={(text) => updateForm("email", text)}
        />

        {/* Phone number field */}
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          style={styles.input}
          value={form.phoneNumber}
          onChangeText={(text) => updateForm("phoneNumber", text)}
        />

        {/* Gender picker */}
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

        {/* Blood type picker */}
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

        {/* Location picker */}
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

        {/* Password with eye icon */}
        <PasswordField
          placeholder="Password"
          value={form.password}
          visible={showPassword}
          onChangeText={(text) => updateForm("password", text)}
          onToggle={() => setShowPassword(!showPassword)}
        />

        {/* Confirm password with eye icon */}
        <PasswordField
          placeholder="Confirm Password"
          value={form.confirmPassword}
          visible={showConfirmPassword}
          onChangeText={(text) => updateForm("confirmPassword", text)}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        {/* Terms and Conditions row */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            style={[styles.checkbox, acceptedTerms && styles.checkedBox]}
            activeOpacity={0.85}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            {acceptedTerms && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text
              style={styles.termsLink}
              onPress={() => setShowTermsModal(true)}
            >
              Terms and Conditions
            </Text>
          </Text>
        </View>

        {/* Sign Up button */}
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

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.bottomText}>Already have an account?</Text>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Gender modal */}
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

      {/* Blood type modal */}
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

      {/* Location modal */}
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

      {/* Terms and Conditions modal */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.termsModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.termsParagraph}>
                By creating a LifeFlow account, you agree to provide true and
                accurate personal information, including your blood type, contact
                number, and location details.
              </Text>

              <Text style={styles.termsParagraph}>
                LifeFlow is designed to help connect blood seekers and possible
                blood donors. Blood requests must only be made for real and valid
                medical needs.
              </Text>

              <Text style={styles.termsParagraph}>
                Users must not post false donor information, fake blood requests,
                or misleading medical details. Any proof or document uploaded
                must be valid and related to the blood request.
              </Text>

              <Text style={styles.termsParagraph}>
                Donors and seekers are responsible for communicating respectfully
                and confirming important details before proceeding with any blood
                donation arrangement.
              </Text>

              <Text style={styles.termsParagraph}>
                LifeFlow may use the provided information to match blood seekers
                with possible donors based on blood type, location, and
                availability.
              </Text>

              <TouchableOpacity
                style={styles.agreeButton}
                activeOpacity={0.85}
                onPress={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
              >
                <Text style={styles.agreeButtonText}>I AGREE</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/*
  Reusable option modal.

  Purpose:
  - Used for Gender and Blood Type.
  - Later, pwede ilipat sa src/components/OptionModal.tsx.
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

  Purpose:
  - Used inside the location picker.
  - Later, pwede ilipat sa src/components/LocationChip.tsx.
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
    paddingBottom: 25,
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
    marginTop: 18,
    marginBottom: 20,
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

  termsModalCard: {
    maxHeight: "80%",
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

  termsParagraph: {
    color: "#555",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },

  agreeButton: {
    backgroundColor: RED,
    height: 52,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
  },

  agreeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});