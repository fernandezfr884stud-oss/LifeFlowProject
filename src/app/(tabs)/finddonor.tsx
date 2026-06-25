import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Donor = {
  id: number;
  name: string;
  bloodType: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  availability: string;
  profileImage?: ImageSourcePropType;
};

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialDonors: Donor[] = [
  {
    id: 1,
    name: "Maria Santos",
    bloodType: "A+",
    region: "Region I",
    province: "Pangasinan",
    city: "Dagupan City",
    barangay: "Pantal",
    availability: "Available",
  },
  {
    id: 2,
    name: "John Reyes",
    bloodType: "O+",
    region: "Region I",
    province: "Pangasinan",
    city: "Calasiao",
    barangay: "Poblacion",
    availability: "Available",
  },
  {
    id: 3,
    name: "Angela Cruz",
    bloodType: "B+",
    region: "Region I",
    province: "Pangasinan",
    city: "Mangaldan",
    barangay: "Guesang",
    availability: "Available",
  },
];

export default function FindDonorScreen() {
  const params = useLocalSearchParams<{ bloodType?: string }>();

  // Main data and filters
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [searchText, setSearchText] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("");

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Add donor form states
  const [form, setForm] = useState({
    name: "",
    bloodType: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    availability: "Available",
  });

  // If user searched from Dashboard, auto-filter blood type here
  useEffect(() => {
    if (params.bloodType) {
      setSelectedBloodType(String(params.bloodType).toUpperCase());
    }
  }, [params.bloodType]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const getFullLocation = (donor: Donor) => {
    return `${donor.barangay}, ${donor.city}, ${donor.province}`;
  };

  const filteredDonors = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    return donors.filter((donor) => {
      const location = getFullLocation(donor).toLowerCase();

      const matchesSearch =
        donor.name.toLowerCase().includes(text) ||
        donor.bloodType.toLowerCase().includes(text) ||
        location.includes(text);

      const matchesBlood = selectedBloodType
        ? donor.bloodType === selectedBloodType
        : true;

      return matchesSearch && matchesBlood;
    });
  }, [donors, searchText, selectedBloodType]);

  const resetForm = () => {
    setForm({
      name: "",
      bloodType: "",
      region: "",
      province: "",
      city: "",
      barangay: "",
      availability: "Available",
    });
  };

  const addDonor = () => {
    const required =
      form.name.trim() &&
      form.bloodType &&
      form.region.trim() &&
      form.province.trim() &&
      form.city.trim() &&
      form.barangay.trim();

    if (!required) {
      Alert.alert("Missing details", "Please complete the donor information.");
      return;
    }

    Alert.alert("Post Donor?", "Are you sure you want to post this donor?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Post",
        onPress: () => {
          const newDonor: Donor = {
            id: Date.now(),
            name: form.name.trim(),
            bloodType: form.bloodType,
            region: form.region.trim(),
            province: form.province.trim(),
            city: form.city.trim(),
            barangay: form.barangay.trim(),
            availability: form.availability,
          };

          setDonors((current) => [newDonor, ...current]);
          resetForm();
          setShowAddModal(false);
        },
      },
    ]);
  };

  const goToRequest = (donor: Donor) => {
    setSelectedDonor(null);

    router.push({
      pathname: "/request",
      params: {
        requestKey: String(Date.now()),
        donorName: donor.name,
        bloodType: donor.bloodType,
        location: getFullLocation(donor),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Find Donor</Text>
            <Text style={styles.subtitle}>Search available blood donors</Text>
          </View>

          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color="#730000" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search and add row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#777" />
            <TextInput
              style={styles.searchInput}
              placeholder="Find donor"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={27} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Blood type filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedBloodType && styles.activeChip]}
            onPress={() => {
              setSelectedBloodType("");
              Keyboard.dismiss();
            }}
          >
            <Text
              style={[
                styles.chipText,
                !selectedBloodType && styles.activeChipText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {bloodTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                selectedBloodType === type && styles.activeChip,
              ]}
              onPress={() => setSelectedBloodType(type)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedBloodType === type && styles.activeChipText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.resultText}>
          {filteredDonors.length} donor
          {filteredDonors.length !== 1 ? "s" : ""} found
        </Text>

        {/* Donor cards */}
        {filteredDonors.map((donor) => (
          <TouchableOpacity
            key={donor.id}
            style={styles.donorCard}
            activeOpacity={0.85}
            onPress={() => setSelectedDonor(donor)}
          >
            {/* Profile image if available, blood type avatar if no image */}
            <View style={styles.avatar}>
              {donor.profileImage ? (
                <Image source={donor.profileImage} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{donor.bloodType}</Text>
              )}
            </View>

            <View style={styles.donorInfo}>
              <Text style={styles.donorName}>{donor.name}</Text>

              <Text style={styles.donorLocation}>
                <Ionicons name="location-outline" size={14} color="#777" />{" "}
                {getFullLocation(donor)}
              </Text>

              <Text style={styles.availability}>{donor.availability}</Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#730000" />
          </TouchableOpacity>
        ))}

        {filteredDonors.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={40} color="#730000" />
            <Text style={styles.emptyTitle}>No donor found</Text>
            <Text style={styles.emptyText}>Try another blood type or location.</Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Add Donor Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Donor</Text>

              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
              >
                <Ionicons name="close" size={25} color="#730000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="#999"
                value={form.name}
                onChangeText={(text) => updateForm("name", text)}
              />

              <Text style={styles.label}>Blood Type</Text>
              <View style={styles.wrap}>
                {bloodTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.formChip,
                      form.bloodType === type && styles.activeChip,
                    ]}
                    onPress={() => updateForm("bloodType", type)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.bloodType === type && styles.activeChipText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Location</Text>

              {/* Same idea as registration: Region, Province, City, Barangay */}
              <TextInput
                style={styles.input}
                placeholder="Region"
                placeholderTextColor="#999"
                value={form.region}
                onChangeText={(text) => updateForm("region", text)}
              />

              <TextInput
                style={styles.input}
                placeholder="Province"
                placeholderTextColor="#999"
                value={form.province}
                onChangeText={(text) => updateForm("province", text)}
              />

              <TextInput
                style={styles.input}
                placeholder="City / Municipality"
                placeholderTextColor="#999"
                value={form.city}
                onChangeText={(text) => updateForm("city", text)}
              />

              <TextInput
                style={styles.input}
                placeholder="Barangay"
                placeholderTextColor="#999"
                value={form.barangay}
                onChangeText={(text) => updateForm("barangay", text)}
              />

              <Text style={styles.label}>Availability</Text>
              <View style={styles.wrap}>
                {["Available", "Not Available"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.formChip,
                      form.availability === status && styles.activeChip,
                    ]}
                    onPress={() => updateForm("availability", status)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.availability === status && styles.activeChipText,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.postBtn} onPress={addDonor}>
                <Text style={styles.postText}>POST DONOR</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Donor Modal */}
      <Modal visible={!!selectedDonor} transparent animationType="fade">
        <View style={styles.overlayCenter}>
          <View style={styles.viewCard}>
            {selectedDonor && (
              <>
                <View style={styles.viewAvatar}>
                  {selectedDonor.profileImage ? (
                    <Image
                      source={selectedDonor.profileImage}
                      style={styles.viewAvatarImage}
                    />
                  ) : (
                    <Text style={styles.viewAvatarText}>
                      {selectedDonor.bloodType}
                    </Text>
                  )}
                </View>

                <Text style={styles.viewName}>{selectedDonor.name}</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {getFullLocation(selectedDonor)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Blood Type</Text>
                  <Text style={styles.detailValue}>
                    {selectedDonor.bloodType}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Availability</Text>
                  <Text style={styles.detailValue}>
                    {selectedDonor.availability}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.requestBtn}
                  onPress={() => goToRequest(selectedDonor)}
                >
                  <Text style={styles.requestText}>REQUEST</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedDonor(null)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const RED = "#730000";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingTop: 55, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  title: { fontSize: 30, fontWeight: "900", color: RED },
  subtitle: { marginTop: 4, fontSize: 13, color: "#777" },
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
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 13 },
  searchBox: {
    flex: 1,
    height: 52,
    borderRadius: 20,
    backgroundColor: "#F4F4F4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginRight: 9,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: "#333" },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
  },
  filterScroll: { marginBottom: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    marginRight: 8,
  },
  activeChip: { backgroundColor: RED, borderColor: RED },
  chipText: { color: RED, fontWeight: "800", fontSize: 13 },
  activeChipText: { color: "#FFFFFF" },
  resultText: { color: "#777", fontWeight: "700", marginBottom: 12 },
  donorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFE1E1",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "#FFFFFF", fontWeight: "900", fontSize: 17 },
  donorInfo: { flex: 1 },
  donorName: { fontSize: 16, fontWeight: "900", color: "#222" },
  donorLocation: { marginTop: 5, color: "#777", fontSize: 13 },
  availability: { marginTop: 6, color: "#178A3B", fontWeight: "800" },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 25,
    marginTop: 20,
  },
  emptyTitle: { marginTop: 10, fontSize: 18, fontWeight: "900", color: RED },
  emptyText: { marginTop: 5, color: "#777", textAlign: "center" },
  bottomSpace: { height: 120 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    maxHeight: "86%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 22,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 24, fontWeight: "900", color: RED },
  input: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  label: { color: RED, fontWeight: "900", marginBottom: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  formChip: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    marginRight: 8,
    marginBottom: 8,
  },
  postBtn: {
    height: 54,
    borderRadius: 22,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  postText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },

  viewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
  },
  viewAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  viewAvatarImage: { width: "100%", height: "100%" },
  viewAvatarText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  viewName: { fontSize: 22, fontWeight: "900", color: "#222", marginBottom: 15 },
  detailRow: {
    width: "100%",
    backgroundColor: "#FFF7F7",
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
  },
  detailLabel: { color: RED, fontWeight: "900", fontSize: 13 },
  detailValue: { color: "#555", marginTop: 4, fontSize: 14 },
  requestBtn: {
    width: "100%",
    height: 52,
    borderRadius: 20,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  requestText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },
  closeText: { marginTop: 13, color: RED, fontWeight: "800" },
});