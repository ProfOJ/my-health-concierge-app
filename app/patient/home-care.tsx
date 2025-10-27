import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { MapPin, ArrowLeft, ChevronDown, X } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

const AVAILABLE_SERVICES = [
  "Nursing Care",
  "Physical Therapy",
  "Medication Administration",
  "Wound Care",
  "Blood Pressure Monitoring",
  "Diabetes Management",
  "Elderly Care",
  "Post-Surgery Care",
  "Injection Services",
  "IV Therapy",
];

export default function HomeCareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [address, setAddress] = useState("");
  const [isPatient, setIsPatient] = useState<boolean | null>(null);
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isAtLocation, setIsAtLocation] = useState<boolean | null>(null);
  const [contactPerson, setContactPerson] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResult) {
        const formattedAddress = [
          addressResult.name,
          addressResult.street,
          addressResult.city,
          addressResult.region,
          addressResult.country,
        ]
          .filter(Boolean)
          .join(", ");
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Failed to get current location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleServiceSelect = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleAddCustomService = () => {
    if (
      serviceSearchQuery.trim() &&
      !selectedServices.includes(serviceSearchQuery.trim()) &&
      !AVAILABLE_SERVICES.includes(serviceSearchQuery.trim())
    ) {
      setSelectedServices([...selectedServices, serviceSearchQuery.trim()]);
      setServiceSearchQuery("");
      setShowServicesDropdown(false);
    }
  };

  const handleRemoveService = (service: string) => {
    setSelectedServices(selectedServices.filter((s) => s !== service));
  };

  const filteredServices = AVAILABLE_SERVICES.filter((service) =>
    service.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  const isFormValid = () => {
    if (!address || isPatient === null || selectedServices.length === 0) {
      return false;
    }

    if (isPatient === false && (!gender || !age)) {
      return false;
    }

    if (isAtLocation === null) {
      return false;
    }

    if (isAtLocation === false && (!contactPerson || !patientName)) {
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("Please fill in all required fields");
      return;
    }

    console.log({
      address,
      isPatient,
      gender,
      age,
      selectedServices,
      isAtLocation,
      contactPerson,
      patientName,
    });

    alert("Request submitted successfully!");
    router.push("/patient/service-type");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>We&apos;re happy to assist you at Home</Text>
        <Text style={styles.subtitle}>
          Kindly share these info with us
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Address where service is needed</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your address"
              placeholderTextColor={colors.text.light}
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <Pressable
              style={styles.mapButton}
              onPress={handleGetCurrentLocation}
              disabled={isLoadingLocation}
            >
              <MapPin
                size={24}
                color={isLoadingLocation ? colors.text.light : colors.primary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Are you the patient?</Text>
          <View style={styles.buttonGroup}>
            <Pressable
              style={[
                styles.optionButton,
                isPatient === true && styles.optionButtonSelected,
              ]}
              onPress={() => setIsPatient(true)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  isPatient === true && styles.optionButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                isPatient === false && styles.optionButtonSelected,
              ]}
              onPress={() => setIsPatient(false)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  isPatient === false && styles.optionButtonTextSelected,
                ]}
              >
                No
              </Text>
            </Pressable>
          </View>
        </View>

        {isPatient === false && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>What is their gender?</Text>
              <View style={styles.buttonGroup}>
                <Pressable
                  style={[
                    styles.optionButton,
                    gender === "Male" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setGender("Male")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      gender === "Male" && styles.optionButtonTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.optionButton,
                    gender === "Female" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setGender("Female")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      gender === "Female" && styles.optionButtonTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.optionButton,
                    gender === "Other" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setGender("Other")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      gender === "Other" && styles.optionButtonTextSelected,
                    ]}
                  >
                    Other
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Input
                label="What is their age?"
                placeholder="Enter age"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>What service do you require?</Text>
          
          {selectedServices.length > 0 && (
            <View style={styles.selectedServicesContainer}>
              {selectedServices.map((service) => (
                <View key={service} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{service}</Text>
                  <Pressable onPress={() => handleRemoveService(service)}>
                    <X size={16} color={colors.text.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={styles.dropdownButton}
            onPress={() => setShowServicesDropdown(!showServicesDropdown)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedServices.length === 0
                ? "Select services"
                : "Add more services"}
            </Text>
            <ChevronDown size={20} color={colors.text.light} />
          </Pressable>

          {showServicesDropdown && (
            <View style={styles.dropdownContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search or type new service..."
                placeholderTextColor={colors.text.light}
                value={serviceSearchQuery}
                onChangeText={setServiceSearchQuery}
              />

              <ScrollView
                style={styles.servicesListContainer}
                nestedScrollEnabled
              >
                {serviceSearchQuery.trim() &&
                  !filteredServices.includes(serviceSearchQuery.trim()) &&
                  !selectedServices.includes(serviceSearchQuery.trim()) && (
                    <Pressable
                      style={styles.serviceOption}
                      onPress={handleAddCustomService}
                    >
                      <Text style={styles.serviceOptionTextAdd}>
                        + Add &quot;{serviceSearchQuery.trim()}&quot;
                      </Text>
                    </Pressable>
                  )}

                {filteredServices.map((service) => (
                  <Pressable
                    key={service}
                    style={[
                      styles.serviceOption,
                      selectedServices.includes(service) &&
                        styles.serviceOptionSelected,
                    ]}
                    onPress={() => handleServiceSelect(service)}
                  >
                    <Text
                      style={[
                        styles.serviceOptionText,
                        selectedServices.includes(service) &&
                          styles.serviceOptionTextSelected,
                      ]}
                    >
                      {service}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Are you at the location where care is needed?
          </Text>
          <View style={styles.buttonGroup}>
            <Pressable
              style={[
                styles.optionButton,
                isAtLocation === true && styles.optionButtonSelected,
              ]}
              onPress={() => setIsAtLocation(true)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  isAtLocation === true && styles.optionButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                isAtLocation === false && styles.optionButtonSelected,
              ]}
              onPress={() => setIsAtLocation(false)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  isAtLocation === false && styles.optionButtonTextSelected,
                ]}
              >
                No
              </Text>
            </Pressable>
          </View>
        </View>

        {isAtLocation === false && (
          <>
            <View style={styles.section}>
              <Input
                label="Who do we call when we get there?"
                placeholder="Enter contact person name"
                value={contactPerson}
                onChangeText={setContactPerson}
              />
            </View>

            <View style={styles.section}>
              <Input
                label="What&apos;s the name of the patient?"
                placeholder="Enter patient name"
                value={patientName}
                onChangeText={setPatientName}
              />
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Request Now"
            onPress={handleSubmit}
            disabled={!isFormValid()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background.cream,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text.secondary,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingRight: 8,
  },
  addressInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 56,
  },
  mapButton: {
    padding: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  optionButtonTextSelected: {
    color: colors.text.inverse,
  },
  selectedServicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  serviceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  serviceTagText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 56,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text.light,
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    overflow: "hidden",
  },
  searchInput: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  servicesListContainer: {
    maxHeight: 250,
  },
  serviceOption: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  serviceOptionSelected: {
    backgroundColor: colors.background.mint,
  },
  serviceOptionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  serviceOptionTextSelected: {
    fontWeight: "600" as const,
    color: colors.primary,
  },
  serviceOptionTextAdd: {
    fontSize: 15,
    color: colors.accent,
    fontWeight: "600" as const,
  },
  buttonContainer: {
    marginTop: 12,
  },
});
