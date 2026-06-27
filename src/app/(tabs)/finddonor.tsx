import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import BloodTypeAvatar from "../../components/BloodTypeAvatar";
import ScreenHeader from "../../components/ScreenHeader";
import StatusBadge from "../../components/StatusBadge";

const RED = "#730000";

type Donor = {
  id: number;
  name: string;
  bloodType: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  availability: "Available" | "Not Available";
  profileImage?: ImageSourcePropType;
};

/*
  Backend-ready donor payload.

  Purpose:
  - This is the format that can be sent to backend later.
*/
type DonorPayload = {
  name: string;
  bloodType: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  availability: "Available" | "Not Available";
};

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const availabilityOptions: Donor["availability"][] = ["Available", "Not Available"];

/*
  Temporary location data.

  Purpose:
  - Front-end demo muna.
  - Later, backend/database can provide full location list.
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
  Temporary donor data.

  Purpose:
  - Dummy data muna habang wala pang backend.
  - Later, donors will be fetched from database/API.
*/
const initialDonors: Donor[] = [
  {
    id: 1,
    name: "Maria Santos",
    bloodType: "A+",
    region: "Ilocos Region",
    province: "Pangasinan",
    city: "Dagupan City",
    barangay: "Pantal",
    availability: "Available",
  },
  {
    id: 2,
    name: "John Reyes",
    bloodType: "O+",
    region: "Ilocos Region",
    province: "Pangasinan",
    city: "Calasiao",
    barangay: "Poblacion",
    availability: "Available",
  },
  {
    id: 3,
    name: "Angela Cruz",
    bloodType: "B+",
    region: "Ilocos Region",
    province: "Pangasinan",
    city: "Mangaldan",
    barangay: "Guesang",
    availability: "Not Available",
  },
];

/*
  Backend placeholder.

  Purpose:
  - Ready-to-connect function.
  - Later, backend partner can replace this with fetch/axios API call.
*/
const addDonorToBackend = async (payload: DonorPayload) => {
  console.log("Add donor payload ready for backend:", payload);

  return {
    success: true,
  };
};

export default function FindDonorScreen() {
  /*
    Receives bloodType from Dashboard AI search.
  */
  const params = useLocalSearchParams<{ bloodType?: string }>();

  /*
    Main states.
  */
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [searchText, setSearchText] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("");

  /*
    Modal states.
  */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  /*
    Add donor form state.
  */
  const [form, setForm] = useState<DonorPayload>({
    name: "",
    bloodType: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    availability: "Available",
  });

  /*
    Auto-filter blood type when coming from Dashboard.
  */
  useEffect(() => {
    if (params.bloodType) {
      setSelectedBloodType(String(params.bloodType).toUpperCase());
    }
  }, [params.bloodType]);

  /*
    Helper for updating add donor form.
  */
  const updateForm = (key: keyof DonorPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  /*
    Full location text.
  */
  const getFullLocation = (donor: Donor | DonorPayload) => {
    return `${donor.barangay}, ${donor.city}, ${donor.province}`;
  };

  /*
    Location picker display text.
  */
  const formLocationText =
    form.region && form.province && form.city && form.barangay
      ? `${form.region}, ${form.province}, ${form.city}, ${form.barangay}`
      : "Region, Province, City, Barangay";

  /*
    Cascading location options.
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
    Filtered donor list.
  */
  const filteredDonors = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    return donors.filter((donor) => {
      const location = getFullLocation(donor).toLowerCase();

      const matchesSearch =
        donor.name.toLowerCase().includes(text) ||
        donor.bloodType.toLowerCase().includes(text) ||
        location.includes(text);

      const matchesBloodType = selectedBloodType
        ? donor.bloodType === selectedBloodType
        : true;

      return matchesSearch && matchesBloodType;
    });
  }, [donors, searchText, selectedBloodType]);

  /*
    Reset add donor form.
  */
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

  /*
    Add donor validation and submit.
  */
  const handleAddDonor = () => {
    if (
      !form.name.trim() ||
      !form.bloodType ||
      !form.region ||
      !form.province ||
      !form.city ||
      !form.barangay
    ) {
      Alert.alert("Missing details", "Please complete the donor information.");
      return;
    }

    Alert.alert("Post Donor?", "Are you sure you want to post this donor?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Post",
        onPress: async () => {
          const payload: DonorPayload = {
            name: form.name.trim(),
            bloodType: form.bloodType,
            region: form.region,
            province: form.province,
            city: form.city,
            barangay: form.barangay,
            availability: form.availability,
          };

          const response = await addDonorToBackend(payload);

          if (!response.success) {
            Alert.alert("Failed", "Unable to post donor.");
            return;
          }

          /*
            Add locally for front-end demo.
            Later, this should refresh from backend.
          */
          const newDonor: Donor = {
            id: Date.now(),
            ...payload,
          };

          setDonors((current) => [newDonor, ...current]);
          resetForm();
          setShowAddModal(false);
        },
      },
    ]);
  };

  /*
    Go to request screen with selected donor details.
  */
  const goToRequest = (donor: Donor) => {
    if (donor.availability !== "Available") {
      Alert.alert(
        "Donor not available",
        "This donor is currently not available for requests."
      );
      return;
    }

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
        keyboardShouldPersistTaps="handled"
      >
        {/* Reusable header */}
        <ScreenHeader
          title="Find Donor"
          subtitle="Search available blood donors"
        />

        {/* Search and add donor row */}
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
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={27} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Blood type filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedBloodType && styles.activeChip]}
            activeOpacity={0.85}
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
              activeOpacity={0.85}
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
            <BloodTypeAvatar
              bloodType={donor.bloodType}
              image={donor.profileImage}
            />

            <View style={styles.donorInfo}>
              <Text style={styles.donorName}>{donor.name}</Text>

              <Text style={styles.donorLocation}>
                <Ionicons name="location-outline" size={14} color="#777" />{" "}
                {getFullLocation(donor)}
              </Text>

              <StatusBadge status={donor.availability} />
            </View>

            <Ionicons name="chevron-forward" size={22} color={RED} />
          </TouchableOpacity>
        ))}

        {/* Empty state */}
        {filteredDonors.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={40} color={RED} />
            <Text style={styles.emptyTitle}>No donor found</Text>
            <Text style={styles.emptyText}>
              Try another blood type or location.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Add Donor Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
      >
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
                <Ionicons name="close" size={25} color={RED} />
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
                    activeOpacity={0.85}
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

              <TouchableOpacity
                style={styles.locationPicker}
                activeOpacity={0.85}
                onPress={() => setShowLocationModal(true)}
              >
                <Text
                  style={[
                    styles.locationPickerText,
                    form.region && styles.selectedLocationText,
                  ]}
                  numberOfLines={1}
                >
                  {formLocationText}
                </Text>

                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <Text style={styles.label}>Availability</Text>

              <View style={styles.wrap}>
                {availabilityOptions.map((status) => {
                  const active = form.availability === status;
                  const notAvailable = status === "Not Available";

                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.formChip,
                        active &&
                          (notAvailable
                            ? styles.activeNotAvailableChip
                            : styles.activeChip),
                      ]}
                      activeOpacity={0.85}
                      onPress={() =>
                        updateForm(
                          "availability",
                          status as Donor["availability"]
                        )
                      }
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
                style={styles.postButton}
                activeOpacity={0.85}
                onPress={handleAddDonor}
              >
                <Text style={styles.postText}>POST DONOR</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.overlayCenter}>
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
              <View style={styles.wrap}>
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
              <View style={styles.wrap}>
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
              <View style={styles.wrap}>
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
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Donor Modal */}
      <Modal
        visible={!!selectedDonor}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDonor(null)}
      >
        <View style={styles.overlayCenter}>
          <View style={styles.viewCard}>
            {selectedDonor && (
              <>
                <BloodTypeAvatar
                  bloodType={selectedDonor.bloodType}
                  image={selectedDonor.profileImage}
                  size={82}
                  fontSize={22}
                />

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
                  <StatusBadge status={selectedDonor.availability} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.requestButton,
                    selectedDonor.availability !== "Available" &&
                      styles.disabledButton,
                  ]}
                  activeOpacity={0.85}
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

/*
  Local reusable chip for location picker.

  Purpose:
  - Used only inside Find Donor location modal.
  - If used in other screens, we can move it to components later.
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
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

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

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#333",
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
  },

  filterScroll: {
    marginBottom: 10,
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    marginRight: 8,
  },

  activeChip: {
    backgroundColor: RED,
    borderColor: RED,
  },

  activeNotAvailableChip: {
    backgroundColor: "#B00000",
    borderColor: "#B00000",
  },

  chipText: {
    color: RED,
    fontWeight: "800",
    fontSize: 13,
  },

  activeChipText: {
    color: "#FFFFFF",
  },

  resultText: {
    color: "#777",
    fontWeight: "700",
    marginBottom: 12,
  },

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

  donorInfo: {
    flex: 1,
    marginLeft: 12,
  },

  donorName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#222",
  },

  donorLocation: {
    marginTop: 5,
    color: "#777",
    fontSize: 13,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFF7F7",
    borderRadius: 24,
    padding: 25,
    marginTop: 20,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "900",
    color: RED,
  },

  emptyText: {
    marginTop: 5,
    color: "#777",
    textAlign: "center",
  },

  bottomSpace: {
    height: 120,
  },

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

  locationModalCard: {
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: RED,
  },

  input: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },

  label: {
    color: RED,
    fontWeight: "900",
    marginBottom: 10,
  },

  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

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

  locationPicker: {
    height: 52,
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

  postButton: {
    height: 54,
    borderRadius: 22,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  postText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  viewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
  },

  viewName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#222",
    marginTop: 12,
    marginBottom: 15,
  },

  detailRow: {
    width: "100%",
    backgroundColor: "#FFF7F7",
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
  },

  detailLabel: {
    color: RED,
    fontWeight: "900",
    fontSize: 13,
    marginBottom: 4,
  },

  detailValue: {
    color: "#555",
    fontSize: 14,
  },

  requestButton: {
    width: "100%",
    height: 52,
    borderRadius: 20,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.45,
  },

  requestText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  closeText: {
    marginTop: 13,
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