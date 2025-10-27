import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { MapPin, ArrowLeft, Mic, Upload, Calendar, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

type UrgencyLevel = "urgent" | "not-urgent" | "flexible";
type RecipientType = "myself" | "someone-else";

export default function HealthSuppliesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [hasPrescription, setHasPrescription] = useState<boolean | null>(null);
  const [prescriptionImages, setPrescriptionImages] = useState<string[]>([]);
  const [whatDoYouNeed, setWhatDoYouNeed] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel | null>(null);
  const [flexibleDate, setFlexibleDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [recipientType, setRecipientType] = useState<RecipientType | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientGender, setRecipientGender] = useState<string>("");
  const [recipientAge, setRecipientAge] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);

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
        setDeliveryAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Failed to get current location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access photos was denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        setPrescriptionImages([...prescriptionImages, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick images");
    }
  };

  const handleRemoveImage = (index: number) => {
    setPrescriptionImages(prescriptionImages.filter((_, i) => i !== index));
  };

  const handleAudioRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      console.log("Started recording...");
    } else {
      console.log("Stopped recording...");
    }
  };

  const handleUrgencySelect = (level: UrgencyLevel) => {
    setUrgency(level);
    setShowUrgencyDropdown(false);
  };

  const getUrgencyLabel = (level: UrgencyLevel) => {
    switch (level) {
      case "urgent":
        return "Urgent (ASAP)";
      case "not-urgent":
        return "Not urgent (1-6 hours)";
      case "flexible":
        return "Flexible (Up to a few days)";
      default:
        return "";
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFlexibleDate(selectedDate);
      if (Platform.OS !== "ios") {
        setShowTimePicker(true);
      }
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const updatedDate = new Date(flexibleDate);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setFlexibleDate(updatedDate);
    }
  };

  const isFormValid = () => {
    if (hasPrescription === null) return false;

    if (hasPrescription && prescriptionImages.length === 0) {
      return false;
    }

    if (!hasPrescription && !whatDoYouNeed) {
      return false;
    }

    if (!deliveryAddress || urgency === null || recipientType === null) {
      return false;
    }

    if (recipientType === "someone-else" && (!recipientName || !recipientGender || !recipientAge)) {
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
      hasPrescription,
      prescriptionImages,
      whatDoYouNeed,
      deliveryAddress,
      urgency,
      flexibleDate: urgency === "flexible" ? flexibleDate : null,
      recipientType,
      recipientName,
      recipientGender,
      recipientAge,
    });

    alert("Health supplies request submitted successfully!");
    router.push("/patient/service-type");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>What do you need, we are happy to get it for you ASAP</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Do you have a prescription?</Text>
          <View style={styles.buttonGroup}>
            <Pressable
              style={[
                styles.optionButton,
                hasPrescription === true && styles.optionButtonSelected,
              ]}
              onPress={() => setHasPrescription(true)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  hasPrescription === true && styles.optionButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                hasPrescription === false && styles.optionButtonSelected,
              ]}
              onPress={() => setHasPrescription(false)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  hasPrescription === false && styles.optionButtonTextSelected,
                ]}
              >
                No
              </Text>
            </Pressable>
          </View>
        </View>

        {hasPrescription === true && (
          <View style={styles.section}>
            <Text style={styles.label}>Upload Prescription Images</Text>
            
            {prescriptionImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesScrollView}
                contentContainerStyle={styles.imagesContainer}
              >
                {prescriptionImages.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.prescriptionImage} />
                    <Pressable
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            <Pressable style={styles.uploadButton} onPress={handlePickImage}>
              <Upload size={24} color={colors.primary} />
              <Text style={styles.uploadButtonText}>
                {prescriptionImages.length > 0 ? "Add More Images" : "Upload Images"}
              </Text>
            </Pressable>
          </View>
        )}

        {hasPrescription === false && (
          <View style={styles.section}>
            <Text style={styles.label}>What do you need?</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe what you need..."
                placeholderTextColor={colors.text.light}
                value={whatDoYouNeed}
                onChangeText={setWhatDoYouNeed}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Pressable
                style={[
                  styles.audioButton,
                  isRecording && styles.audioButtonActive,
                ]}
                onPress={handleAudioRecord}
              >
                <Mic
                  size={20}
                  color={isRecording ? colors.error : colors.primary}
                />
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Where do you need it?</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter delivery address"
              placeholderTextColor={colors.text.light}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
            />
            <Pressable
              style={styles.locationButton}
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
          <Text style={styles.label}>How soon do you need it?</Text>
          <Pressable
            style={styles.dropdownButton}
            onPress={() => setShowUrgencyDropdown(!showUrgencyDropdown)}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                urgency && styles.dropdownButtonTextSelected,
              ]}
            >
              {urgency ? getUrgencyLabel(urgency) : "Select urgency level"}
            </Text>
            <ChevronDown size={20} color={colors.text.light} />
          </Pressable>

          {showUrgencyDropdown && (
            <View style={styles.dropdownContainer}>
              <Pressable
                style={[
                  styles.dropdownOption,
                  urgency === "urgent" && styles.dropdownOptionSelected,
                ]}
                onPress={() => handleUrgencySelect("urgent")}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    urgency === "urgent" && styles.dropdownOptionTextSelected,
                  ]}
                >
                  Urgent (ASAP)
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dropdownOption,
                  urgency === "not-urgent" && styles.dropdownOptionSelected,
                ]}
                onPress={() => handleUrgencySelect("not-urgent")}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    urgency === "not-urgent" && styles.dropdownOptionTextSelected,
                  ]}
                >
                  Not urgent (1-6 hours)
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dropdownOption,
                  urgency === "flexible" && styles.dropdownOptionSelected,
                ]}
                onPress={() => handleUrgencySelect("flexible")}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    urgency === "flexible" && styles.dropdownOptionTextSelected,
                  ]}
                >
                  Flexible (Up to a few days)
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {urgency === "flexible" && (
          <View style={styles.section}>
            <Text style={styles.label}>By when do you need it?</Text>
            <Pressable
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>
                {flexibleDate.toLocaleDateString()} at{" "}
                {flexibleDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={flexibleDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && Platform.OS !== "ios" && (
              <DateTimePicker
                value={flexibleDate}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            {Platform.OS === "ios" && showDatePicker && (
              <View style={styles.iosPickerActions}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.pickerButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.pickerButton, styles.pickerButtonPrimary]}
                  onPress={() => {
                    setShowDatePicker(false);
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.pickerButtonTextPrimary}>Set Time</Text>
                </Pressable>
              </View>
            )}

            {Platform.OS === "ios" && showTimePicker && (
              <>
                <DateTimePicker
                  value={flexibleDate}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                />
                <View style={styles.iosPickerActions}>
                  <Pressable
                    style={styles.pickerButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.pickerButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.pickerButton, styles.pickerButtonPrimary]}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.pickerButtonTextPrimary}>Done</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Is this for you or someone else?</Text>
          <View style={styles.buttonGroup}>
            <Pressable
              style={[
                styles.optionButton,
                recipientType === "myself" && styles.optionButtonSelected,
              ]}
              onPress={() => setRecipientType("myself")}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  recipientType === "myself" && styles.optionButtonTextSelected,
                ]}
              >
                Myself
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                recipientType === "someone-else" && styles.optionButtonSelected,
              ]}
              onPress={() => setRecipientType("someone-else")}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  recipientType === "someone-else" && styles.optionButtonTextSelected,
                ]}
              >
                Someone else
              </Text>
            </Pressable>
          </View>
        </View>

        {recipientType === "someone-else" && (
          <>
            <View style={styles.section}>
              <Input
                label="Recipient's Name"
                placeholder="Enter recipient's name"
                value={recipientName}
                onChangeText={setRecipientName}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Recipient&apos;s Gender</Text>
              <View style={styles.buttonGroup}>
                <Pressable
                  style={[
                    styles.optionButton,
                    recipientGender === "Male" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setRecipientGender("Male")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      recipientGender === "Male" && styles.optionButtonTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.optionButton,
                    recipientGender === "Female" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setRecipientGender("Female")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      recipientGender === "Female" && styles.optionButtonTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.optionButton,
                    recipientGender === "Other" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setRecipientGender("Other")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      recipientGender === "Other" && styles.optionButtonTextSelected,
                    ]}
                  >
                    Other
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Input
                label="Recipient's Age"
                placeholder="Enter recipient's age"
                keyboardType="numeric"
                value={recipientAge}
                onChangeText={setRecipientAge}
              />
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Request"
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
    lineHeight: 32,
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
  imagesScrollView: {
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  prescriptionImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.inverse,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingVertical: 16,
    borderStyle: "dashed",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  textAreaContainer: {
    position: "relative",
  },
  textArea: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    paddingRight: 56,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 120,
  },
  audioButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.cream,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  audioButtonActive: {
    backgroundColor: colors.card.peach,
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
  locationButton: {
    padding: 12,
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
  dropdownButtonTextSelected: {
    color: colors.text.primary,
    fontWeight: "600" as const,
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.background.mint,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  dropdownOptionTextSelected: {
    fontWeight: "600" as const,
    color: colors.primary,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 56,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  iosPickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 12,
    alignItems: "center",
  },
  pickerButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  pickerButtonTextPrimary: {
    color: colors.text.inverse,
  },
  buttonContainer: {
    marginTop: 12,
  },
});
