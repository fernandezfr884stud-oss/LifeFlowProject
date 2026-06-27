import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHeader from "../../components/ScreenHeader";
import StatusBadge from "../../components/StatusBadge";

const RED = "#730000";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const availabilityOptions = ["Available", "Not Available"] as const;

/*
  Temporary location data.

  Purpose:
  - Front-end demo muna habang wala pang backend.
  - Later, backend/database can provide the full address list.
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

type Availability = (typeof availabilityOptions)[number];

/*
  Profile data structure.

  Purpose:
  - Ito yung profile fields na ipapakita at ie-edit ng user.
  - Later, backend will return this data after login.
*/
type ProfileData = {
  name: string;
  email: string;
  contactNumber: string;
  bloodType: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  availability: Availability;
  profileImage: string;
};

/*
  Backend placeholder: fetch profile.

  Purpose:
  - Later, papalitan ito ng API call like GET /profile.
*/
const getProfileFromBackend = async (): Promise<ProfileData> => {
  return {
    name: "Chloe Ellamil",
    email: "chloe@example.com",
    contactNumber: "09XXXXXXXXX",
    bloodType: "A+",
    region: "Ilocos Region",
    province: "Pangasinan",
    city: "Dagupan City",
    barangay: "Pantal",
    availability: "Available",
    profileImage: "",
  };
};

/*
  Backend placeholder: update profile.

  Purpose:
  - Later, papalitan ito ng API call like PUT /profile.
*/
const updateProfileToBackend = async (payload: ProfileData) => {
  console.log("Profile update payload ready for backend:", payload);

  return {
    success: true,
  };
};

/*
  Backend placeholder: delete account.

  Purpose:
  - Later, papalitan ito ng API call like DELETE /account.
*/
const deleteAccountFromBackend = async () => {
  console.log("Delete account request ready for backend.");

  return {
    success: true,
  };
};

/*
  Backend placeholder: logout.

  Purpose:
  - Later, this should clear token/session.
*/
const logoutUser = async () => {
  console.log("Logout ready for backend/session handling.");

  return {
    success: true,
  };
};

export default function ProfileScreen() {
  /*
    Loading states.

    Purpose:
    - isLoading is for initial profile loading.
    - isSaving is for save profile button.
  */
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /*
    editMode controls if user is viewing or editing profile.
  */
  const [editMode, setEditMode] = useState(false);

  /*
    profile = saved/current profile shown in view mode.
    editProfile = temporary editable copy while editing.
  */
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editProfile, setEditProfile] = useState<ProfileData | null>(null);

  /*
    Location modal state for cascading picker.
  */
  const [showLocationModal, setShowLocationModal] = useState(false);

  /*
    Load profile when screen opens.

    Later:
    - This will fetch logged-in user's profile from backend.
  */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getProfileFromBackend();

        setProfile(userProfile);
        setEditProfile(userProfile);
      } catch (error) {
        Alert.alert("Error", "Unable to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  /*
    Helper for updating edit profile fields.
  */
  const updateEditProfile = (key: keyof ProfileData, value: string) => {
    setEditProfile((current) => {
      if (!current) return current;

      return {
        ...current,
        [key]: value,
      };
    });
  };

  /*
    Opens edit mode.

    Purpose:
    - Creates a copy of saved profile.
    - If user cancels, original profile stays unchanged.
  */
  const openEditMode = () => {
    if (!profile) return;

    setEditProfile(profile);
    setEditMode(true);
  };

  /*
    Cancel edit.

    Purpose:
    - Restores old saved data.
  */
  const cancelEdit = () => {
    setEditProfile(profile);
    setShowLocationModal(false);
    setEditMode(false);
  };

  /*
    Pick profile image from gallery.

    Purpose:
    - Front-end preview muna.
    - Later, image URI/file will be uploaded to backend.
  */
  const pickProfileImage = async () => {
    if (!editMode) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to upload a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateEditProfile("profileImage", result.assets[0].uri);
    }
  };

  /*
    Validate profile before saving.
  */
  const validateProfile = () => {
    if (!editProfile) return false;

    if (
      !editProfile.name.trim() ||
      !editProfile.email.trim() ||
      !editProfile.contactNumber.trim() ||
      !editProfile.bloodType ||
      !editProfile.region ||
      !editProfile.province ||
      !editProfile.city ||
      !editProfile.barangay ||
      !editProfile.availability
    ) {
      Alert.alert("Missing details", "Please complete your profile details.");
      return false;
    }

    if (!editProfile.email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return false;
    }

    if (editProfile.contactNumber.trim().length < 10) {
      Alert.alert("Invalid number", "Please enter a valid contact number.");
      return false;
    }

    return true;
  };

  /*
    Save profile.

    Purpose:
    - Sends updated profile to backend placeholder.
    - Updates local profile after success.
  */
  const saveProfile = async () => {
    if (!editProfile || !validateProfile()) return;

    try {
      setIsSaving(true);

      const payload: ProfileData = {
        ...editProfile,
        name: editProfile.name.trim(),
        email: editProfile.email.trim().toLowerCase(),
        contactNumber: editProfile.contactNumber.trim(),
      };

      const response = await updateProfileToBackend(payload);

      if (!response.success) {
        Alert.alert("Failed", "Unable to update profile.");
        return;
      }

      setProfile(payload);
      setEditProfile(payload);
      setEditMode(false);

      Alert.alert("Profile Saved", "Your profile has been updated.");
    } catch (error) {
      Alert.alert("Something went wrong", "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  /*
    Logout.

    Purpose:
    - Later, backend/session token will be cleared here.
  */
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          router.replace("/login");
        },
      },
    ]);
  };

  /*
    Delete account.

    Purpose:
    - User account deletion confirmation.
    - Later, backend will delete/deactivate the user account.
  */
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const response = await deleteAccountFromBackend();

            if (!response.success) {
              Alert.alert("Failed", "Unable to delete account.");
              return;
            }

            Alert.alert("Account Deleted", "Your account has been deleted.");
            router.replace("/login");
          },
        },
      ]
    );
  };

  /*
    Location display.
  */
  const getFullLocation = (data: ProfileData | null) => {
    if (!data) return "";

    return `${data.barangay}, ${data.city}, ${data.province}`;
  };

  /*
    Location picker text.
  */
  const editLocationText =
    editProfile?.region &&
    editProfile?.province &&
    editProfile?.city &&
    editProfile?.barangay
      ? `${editProfile.region}, ${editProfile.province}, ${editProfile.city}, ${editProfile.barangay}`
      : "Region, Province, City, Barangay";

  /*
    Cascading location options.
  */
  const provinceOptions = editProfile?.region
    ? Object.keys(locationData[editProfile.region] || {})
    : [];

  const cityOptions =
    editProfile?.region && editProfile?.province
      ? Object.keys(locationData[editProfile.region]?.[editProfile.province] || {})
      : [];

  const barangayOptions =
    editProfile?.region && editProfile?.province && editProfile?.city
      ? locationData[editProfile.region]?.[editProfile.province]?.[
          editProfile.city
        ] || []
      : [];

  if (isLoading || !profile || !editProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={RED} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const displayData = editMode ? editProfile : profile;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Reusable header */}
        <ScreenHeader
          title="Profile"
          subtitle="Manage your donor information"
        />

        {/* Profile card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatar}
            activeOpacity={editMode ? 0.85 : 1}
            onPress={pickProfileImage}
          >
            {displayData.profileImage ? (
              <Image
                source={{ uri: displayData.profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {displayData.bloodType || "?"}
              </Text>
            )}

            {editMode && (
              <View style={styles.cameraBtn}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.profileName}>{displayData.name}</Text>
          <Text style={styles.profileLocation}>
            {getFullLocation(displayData)}
          </Text>

          <View style={styles.statusWrapper}>
            <StatusBadge status={displayData.availability} />
          </View>

          {!editMode && (
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              onPress={openEditMode}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={styles.editText}>EDIT PROFILE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary cards */}
        {!editMode && (
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="water-outline"
              label="Blood Type"
              value={profile.bloodType}
            />

            <SummaryCard
              icon="location-outline"
              label="City"
              value={profile.city}
            />
          </View>
        )}

        {editMode ? (
          /*
            Edit mode.
          */
          <View>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#999"
              value={editProfile.name}
              onChangeText={(text) => updateEditProfile("name", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={editProfile.email}
              onChangeText={(text) => updateEditProfile("email", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Contact number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={editProfile.contactNumber}
              onChangeText={(text) => updateEditProfile("contactNumber", text)}
            />

            <Text style={styles.sectionTitle}>Blood Type</Text>

            <View style={styles.wrap}>
              {bloodTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    editProfile.bloodType === type && styles.activeChip,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => updateEditProfile("bloodType", type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      editProfile.bloodType === type &&
                        styles.activeChipText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Location</Text>

            <TouchableOpacity
              style={styles.locationPicker}
              activeOpacity={0.85}
              onPress={() => setShowLocationModal(true)}
            >
              <Text
                style={[
                  styles.locationPickerText,
                  editProfile.region && styles.selectedLocationText,
                ]}
                numberOfLines={1}
              >
                {editLocationText}
              </Text>

              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Availability</Text>

            <View style={styles.wrap}>
              {availabilityOptions.map((status) => {
                const active = editProfile.availability === status;
                const notAvailable = status === "Not Available";

                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.availabilityChip,
                      active &&
                        (notAvailable
                          ? styles.activeNotAvailableChip
                          : styles.activeAvailableChip),
                    ]}
                    activeOpacity={0.85}
                    onPress={() => updateEditProfile("availability", status)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.activeChipText,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.disabledButton]}
              activeOpacity={0.85}
              onPress={saveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={19} color="#FFFFFF" />
                  <Text style={styles.saveText}>SAVE PROFILE</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.85}
              onPress={cancelEdit}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /*
            View mode.
          */
          <View>
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <ProfileRow
                icon="mail-outline"
                label="Email"
                value={profile.email}
              />

              <ProfileRow
                icon="call-outline"
                label="Contact Number"
                value={profile.contactNumber}
              />

              <ProfileRow
                icon="water-outline"
                label="Blood Type"
                value={profile.bloodType}
              />

              <ProfileRow
                icon="location-outline"
                label="Location"
                value={getFullLocation(profile)}
              />

              <ProfileRow
                icon="person-circle-outline"
                label="Availability"
                value={profile.availability}
                valueColor={
                  profile.availability === "Available"
                    ? "#178A3B"
                    : "#B00000"
                }
              />
            </View>

            <View style={styles.accountCard}>
              <Text style={styles.sectionTitle}>Account Settings</Text>

              <TouchableOpacity
                style={styles.accountRow}
                activeOpacity={0.85}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={21} color={RED} />

                <Text style={styles.accountText}>Logout</Text>

                <Ionicons name="chevron-forward" size={19} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.accountRow}
                activeOpacity={0.85}
                onPress={handleDeleteAccount}
              >
                <Ionicons name="trash-outline" size={21} color="#B00000" />

                <Text style={styles.deleteText}>Delete Account</Text>

                <Ionicons name="chevron-forward" size={19} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

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

              <View style={styles.wrap}>
                {Object.keys(locationData).map((region) => (
                  <LocationChip
                    key={region}
                    label={region}
                    active={editProfile.region === region}
                    onPress={() => {
                      updateEditProfile("region", region);
                      updateEditProfile("province", "");
                      updateEditProfile("city", "");
                      updateEditProfile("barangay", "");
                    }}
                  />
                ))}
              </View>

              <Text style={styles.locationLabel}>Province</Text>

              <View style={styles.wrap}>
                {provinceOptions.length > 0 ? (
                  provinceOptions.map((province) => (
                    <LocationChip
                      key={province}
                      label={province}
                      active={editProfile.province === province}
                      onPress={() => {
                        updateEditProfile("province", province);
                        updateEditProfile("city", "");
                        updateEditProfile("barangay", "");
                      }}
                    />
                  ))
                ) : (
                  <Text style={styles.helperText}>Select region first</Text>
                )}
              </View>

              <Text style={styles.locationLabel}>City / Municipality</Text>

              <View style={styles.wrap}>
                {cityOptions.length > 0 ? (
                  cityOptions.map((city) => (
                    <LocationChip
                      key={city}
                      label={city}
                      active={editProfile.city === city}
                      onPress={() => {
                        updateEditProfile("city", city);
                        updateEditProfile("barangay", "");
                      }}
                    />
                  ))
                ) : (
                  <Text style={styles.helperText}>Select province first</Text>
                )}
              </View>

              <Text style={styles.locationLabel}>Barangay</Text>

              <View style={styles.wrap}>
                {barangayOptions.length > 0 ? (
                  barangayOptions.map((barangay) => (
                    <LocationChip
                      key={barangay}
                      label={barangay}
                      active={editProfile.barangay === barangay}
                      onPress={() => updateEditProfile("barangay", barangay)}
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
                    !editProfile.region ||
                    !editProfile.province ||
                    !editProfile.city ||
                    !editProfile.barangay
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
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/*
  Summary card.

  Purpose:
  - Shows quick profile highlights like blood type and city.
*/
function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Ionicons name={icon} size={21} color={RED} />

      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

/*
  Profile row.

  Purpose:
  - Shows one profile detail in view mode.
*/
function ProfileRow({
  icon,
  label,
  value,
  valueColor = "#555",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.profileRow}>
      <Ionicons name={icon} size={20} color={RED} />

      <View style={styles.profileRowText}>
        <Text style={styles.profileRowLabel}>{label}</Text>
        <Text style={[styles.profileRowValue, { color: valueColor }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/*
  Location chip.

  Purpose:
  - Used inside cascading location picker.
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: RED,
    fontWeight: "800",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  profileCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginBottom: 16,
  },

  avatar: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 53,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  cameraBtn: {
    position: "absolute",
    right: 2,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  profileName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#222",
  },

  profileLocation: {
    color: "#777",
    marginTop: 5,
    textAlign: "center",
  },

  statusWrapper: {
    marginTop: 12,
    alignItems: "center",
  },

  editBtn: {
    height: 44,
    borderRadius: 18,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 18,
    marginTop: 16,
  },

  editText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 6,
  },

  summaryRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFF7F7",
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginRight: 8,
  },

  summaryLabel: {
    color: "#777",
    fontSize: 12,
    marginTop: 8,
  },

  summaryValue: {
    color: RED,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },

  sectionTitle: {
    color: RED,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
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

  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 13,
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    marginRight: 8,
    marginBottom: 8,
  },

  availabilityChip: {
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

  activeAvailableChip: {
    backgroundColor: "#178A3B",
    borderColor: "#178A3B",
  },

  activeNotAvailableChip: {
    backgroundColor: "#B00000",
    borderColor: "#B00000",
  },

  chipText: {
    color: RED,
    fontWeight: "900",
    fontSize: 13,
  },

  activeChipText: {
    color: "#FFFFFF",
  },

  locationPicker: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  locationPickerText: {
    flex: 1,
    color: "#999",
    fontSize: 15,
  },

  selectedLocationText: {
    color: "#333",
    fontWeight: "600",
  },

  saveBtn: {
    height: 54,
    borderRadius: 22,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 8,
  },

  cancelBtn: {
    alignItems: "center",
    marginTop: 14,
  },

  cancelText: {
    color: RED,
    fontSize: 14,
    fontWeight: "900",
  },

  detailsCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginBottom: 16,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE1E1",
  },

  profileRowText: {
    marginLeft: 12,
    flex: 1,
  },

  profileRowLabel: {
    color: RED,
    fontSize: 13,
    fontWeight: "900",
  },

  profileRowValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
  },

  accountCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FFE1E1",
  },

  accountRow: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE1E1",
  },

  accountText: {
    flex: 1,
    color: "#333",
    fontWeight: "800",
    marginLeft: 10,
  },

  deleteText: {
    flex: 1,
    color: "#B00000",
    fontWeight: "900",
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 25,
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

  locationLabel: {
    color: RED,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 6,
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

  doneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});