import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RED = "#730000";
const GREEN = "#178A3B";
const NOT_AVAILABLE_RED = "#B00000";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const availabilityOptions = ["Available", "Not Available"];

export default function ProfileScreen() {
  /*
    These params can come from Register screen.
    Example: after registration, user will be redirected here.
  */
  const params = useLocalSearchParams<{
    name?: string;
    email?: string;
    contactNumber?: string;
    bloodType?: string;
    region?: string;
    province?: string;
    city?: string;
    barangay?: string;
  }>();

  /*
    If profileImage is empty, blood type will be used as temporary avatar.
  */
  const [profileImage, setProfileImage] = useState("");

  /*
    editMode controls if user can edit profile fields.
    Default is false, so profile is view-only first.
  */
  const [editMode, setEditMode] = useState(false);

  /*
    Temporary front-end profile data.
    Later, this will come from backend/database.
  */
  const [profile, setProfile] = useState({
    name: "Chloe Ellamil",
    email: "chloe@example.com",
    contactNumber: "09XXXXXXXXX",
    bloodType: "A+",
    region: "Region I",
    province: "Pangasinan",
    city: "Dagupan City",
    barangay: "Pantal",
    availability: "Available",
  });

  /*
    This receives the register data and places it inside profile.
  */
  useEffect(() => {
    if (!params.name) return;

    setProfile((current) => ({
      ...current,
      name: String(params.name || current.name),
      email: String(params.email || current.email),
      contactNumber: String(params.contactNumber || current.contactNumber),
      bloodType: String(params.bloodType || current.bloodType),
      region: String(params.region || current.region),
      province: String(params.province || current.province),
      city: String(params.city || current.city),
      barangay: String(params.barangay || current.barangay),
    }));
  }, [
    params.name,
    params.email,
    params.contactNumber,
    params.bloodType,
    params.region,
    params.province,
    params.city,
    params.barangay,
  ]);

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  /*
    Pick image from gallery.
    This only works when user is in Edit Profile mode.
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
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveProfile = () => {
    if (
      !profile.name.trim() ||
      !profile.email.trim() ||
      !profile.contactNumber.trim() ||
      !profile.bloodType ||
      !profile.region.trim() ||
      !profile.province.trim() ||
      !profile.city.trim() ||
      !profile.barangay.trim()
    ) {
      Alert.alert("Missing details", "Please complete your profile details.");
      return;
    }

    setEditMode(false);
    Alert.alert("Profile Saved", "Your profile has been updated.");
  };

  const fullLocation = `${profile.barangay}, ${profile.city}, ${profile.province}`;
  const isAvailable = profile.availability === "Available";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your donor information</Text>
        </View>

        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={RED} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.avatar}
          activeOpacity={editMode ? 0.85 : 1}
          onPress={pickProfileImage}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{profile.bloodType || "?"}</Text>
          )}

          {editMode && (
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileLocation}>{fullLocation}</Text>

        <View
          style={[
            styles.statusBadge,
            isAvailable ? styles.availableBadge : styles.notAvailableBadge,
          ]}
        >
          <Ionicons
            name="ellipse"
            size={10}
            color={isAvailable ? GREEN : NOT_AVAILABLE_RED}
          />
          <Text
            style={[
              styles.statusText,
              isAvailable ? styles.availableText : styles.notAvailableText,
            ]}
          >
            {profile.availability}
          </Text>
        </View>

        {!editMode && (
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.85}
            onPress={() => setEditMode(true)}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.editText}>EDIT PROFILE</Text>
          </TouchableOpacity>
        )}
      </View>

      {editMode ? (
        /*
          Edit Profile Mode
        */
        <View>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#999"
            value={profile.name}
            onChangeText={(text) => updateProfile("name", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={profile.email}
            onChangeText={(text) => updateProfile("email", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Contact number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={profile.contactNumber}
            onChangeText={(text) => updateProfile("contactNumber", text)}
          />

          <Text style={styles.sectionTitle}>Blood Type</Text>

          <View style={styles.wrap}>
            {bloodTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  profile.bloodType === type && styles.activeChip,
                ]}
                activeOpacity={0.85}
                onPress={() => updateProfile("bloodType", type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    profile.bloodType === type && styles.activeChipText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Location</Text>

          <TextInput
            style={styles.input}
            placeholder="Region"
            placeholderTextColor="#999"
            value={profile.region}
            onChangeText={(text) => updateProfile("region", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Province"
            placeholderTextColor="#999"
            value={profile.province}
            onChangeText={(text) => updateProfile("province", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="City / Municipality"
            placeholderTextColor="#999"
            value={profile.city}
            onChangeText={(text) => updateProfile("city", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Barangay"
            placeholderTextColor="#999"
            value={profile.barangay}
            onChangeText={(text) => updateProfile("barangay", text)}
          />

          <Text style={styles.sectionTitle}>Availability</Text>

          <View style={styles.wrap}>
            {availabilityOptions.map((status) => {
              const active = profile.availability === status;
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
                  onPress={() => updateProfile("availability", status)}
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
            style={styles.saveBtn}
            activeOpacity={0.85}
            onPress={saveProfile}
          >
            <Ionicons name="save-outline" size={19} color="#FFFFFF" />
            <Text style={styles.saveText}>SAVE PROFILE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.85}
            onPress={() => setEditMode(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /*
          View Profile Mode
        */
        <View style={styles.detailsCard}>
          <ProfileRow icon="mail-outline" label="Email" value={profile.email} />
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
            value={fullLocation}
          />
          <ProfileRow
            icon="person-circle-outline"
            label="Availability"
            value={profile.availability}
            valueColor={isAvailable ? GREEN : NOT_AVAILABLE_RED}
          />
        </View>
      )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 120,
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

  profileCard: {
    backgroundColor: "#FFF7F7",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE1E1",
    marginBottom: 20,
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

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
  },

  availableBadge: {
    backgroundColor: "#EAF8EF",
  },

  notAvailableBadge: {
    backgroundColor: "#FFECEC",
  },

  statusText: {
    fontWeight: "900",
    fontSize: 13,
    marginLeft: 6,
  },

  availableText: {
    color: GREEN,
  },

  notAvailableText: {
    color: NOT_AVAILABLE_RED,
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
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  activeNotAvailableChip: {
    backgroundColor: NOT_AVAILABLE_RED,
    borderColor: NOT_AVAILABLE_RED,
  },

  chipText: {
    color: RED,
    fontWeight: "900",
    fontSize: 13,
  },

  activeChipText: {
    color: "#FFFFFF",
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

  bottomSpace: {
    height: 40,
  },
});