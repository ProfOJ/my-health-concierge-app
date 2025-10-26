import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { HEALTHCARE_ROLES, HEALTHCARE_SERVICES } from "@/constants/assistants";
import { useApp } from "@/contexts/AppContext";
import * as ImagePicker from "expo-image-picker";
import { Camera, Check, ChevronDown, ChevronRight, Upload, Database } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AccordionSection = "general" | "kyc" | "services" | "pricing" | null;
type PricingModel = "fixed" | "hourly" | "bespoke";

export default function ProfileScreen() {
  const { assistantProfile, saveAssistantProfile } = useApp();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<AccordionSection>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [generalData, setGeneralData] = useState({
    name: assistantProfile?.name || "",
    email: assistantProfile?.email || "",
    phone: assistantProfile?.phone || "",
    address: assistantProfile?.address || "",
    photo: assistantProfile?.photo || "",
  });

  const [kycData, setKycData] = useState({
    role: assistantProfile?.role || "",
    idPhoto: assistantProfile?.idPhoto || "",
    otherDetails: assistantProfile?.otherDetails || "",
  });

  const [selectedServices, setSelectedServices] = useState<string[]>(
    assistantProfile?.services || []
  );

  const [pricingData, setPricingData] = useState({
    model: assistantProfile?.pricingModel || ("fixed" as PricingModel),
    fixedRate: assistantProfile?.rate?.toString() || "",
    hourlyRate: assistantProfile?.rate?.toString() || "",
    minRate: assistantProfile?.rateRange?.min?.toString() || "",
    maxRate: assistantProfile?.rateRange?.max?.toString() || "",
  });

  const toggleSection = (section: AccordionSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as const,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setGeneralData({ ...generalData, photo: result.assets[0].uri });
    }
  };

  const pickIdPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as const,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setKycData({ ...kycData, idPhoto: result.assets[0].uri });
    }
  };

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSave = async () => {
    if (!assistantProfile) return;

    setIsSaving(true);
    try {
      const updatedProfile = {
        ...assistantProfile,
        ...generalData,
        ...kycData,
        services: selectedServices,
        pricingModel: pricingData.model,
        rate:
          pricingData.model === "fixed"
            ? parseFloat(pricingData.fixedRate)
            : pricingData.model === "hourly"
            ? parseFloat(pricingData.hourlyRate)
            : undefined,
        rateRange:
          pricingData.model === "bespoke"
            ? {
                min: parseFloat(pricingData.minRate),
                max: parseFloat(pricingData.maxRate),
              }
            : undefined,
      };

      await saveAssistantProfile(updatedProfile);
      setExpandedSection(null);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: "verified" | "pending" | "rejected") => {
    switch (status) {
      case "verified":
        return colors.success;
      case "pending":
        return colors.warning;
      case "rejected":
        return colors.error;
    }
  };

  const getStatusText = (status: "verified" | "pending" | "rejected") => {
    switch (status) {
      case "verified":
        return "Verified";
      case "pending":
        return "Pending Verification";
      case "rejected":
        return "Verification Rejected";
    }
  };

  if (!assistantProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No profile found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile Settings</Text>

        <View style={styles.profileHeader}>
          <View style={styles.photoContainer}>
            {assistantProfile.photo ? (
              <Image source={{ uri: assistantProfile.photo }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera size={40} color={colors.text.secondary} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{assistantProfile.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assistantProfile.verificationStatus) + "20" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(assistantProfile.verificationStatus) }]}>
              {getStatusText(assistantProfile.verificationStatus)}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.testButton}
          onPress={() => router.push("/assistant/db-test")}
        >
          <View style={styles.testButtonContent}>
            <Database size={24} color={colors.primary} />
            <View style={styles.testButtonText}>
              <Text style={styles.testButtonTitle}>Database Connection Test</Text>
              <Text style={styles.testButtonDescription}>Test CRUD operations</Text>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </View>
        </Pressable>

        <View style={styles.accordionContainer}>
          <Pressable
            style={styles.accordionHeader}
            onPress={() => toggleSection("general")}
          >
            <Text style={styles.accordionTitle}>General Information</Text>
            {expandedSection === "general" ? (
              <ChevronDown size={24} color={colors.text.primary} />
            ) : (
              <ChevronRight size={24} color={colors.text.secondary} />
            )}
          </Pressable>
          {expandedSection === "general" && (
            <View style={styles.accordionContent}>
              <View style={styles.photoSection}>
                <Pressable style={styles.photoEditButton} onPress={pickPhoto}>
                  {generalData.photo ? (
                    <Image source={{ uri: generalData.photo }} style={styles.editPhoto} />
                  ) : (
                    <>
                      <View style={styles.photoEditPlaceholder}>
                        <Camera size={28} color={colors.text.secondary} />
                      </View>
                      <Text style={styles.photoEditText}>Change Photo</Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Input
                label="Full Name"
                value={generalData.name}
                onChangeText={(name) => setGeneralData({ ...generalData, name })}
                placeholder="Enter your full name"
              />

              <Input
                label="Email Address"
                value={generalData.email}
                onChangeText={(email) => setGeneralData({ ...generalData, email })}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Phone Number"
                value={generalData.phone}
                onChangeText={(phone) => setGeneralData({ ...generalData, phone })}
                placeholder="+233 XX XXX XXXX"
                keyboardType="phone-pad"
              />

              <Input
                label="Address"
                value={generalData.address}
                onChangeText={(address) => setGeneralData({ ...generalData, address })}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
            </View>
          )}
        </View>

        <View style={styles.accordionContainer}>
          <Pressable
            style={styles.accordionHeader}
            onPress={() => toggleSection("kyc")}
          >
            <Text style={styles.accordionTitle}>KYC & Credentials</Text>
            {expandedSection === "kyc" ? (
              <ChevronDown size={24} color={colors.text.primary} />
            ) : (
              <ChevronRight size={24} color={colors.text.secondary} />
            )}
          </Pressable>
          {expandedSection === "kyc" && (
            <View style={styles.accordionContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>I am a...</Text>
                <Pressable
                  style={styles.selectButton}
                  onPress={() => setShowRolePicker(true)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      !kycData.role && styles.selectPlaceholder,
                    ]}
                  >
                    {kycData.role || "Select your role"}
                  </Text>
                  <ChevronDown size={20} color={colors.text.secondary} />
                </Pressable>
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.label}>ID Photo</Text>
                <Pressable style={styles.uploadButton} onPress={pickIdPhoto}>
                  {kycData.idPhoto ? (
                    <Image source={{ uri: kycData.idPhoto }} style={styles.idPhoto} />
                  ) : (
                    <>
                      <View style={styles.uploadIcon}>
                        <Upload size={28} color={colors.primary} />
                      </View>
                      <Text style={styles.uploadText}>Tap to upload ID</Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Input
                label="Other Details (Optional)"
                value={kycData.otherDetails}
                onChangeText={(otherDetails) =>
                  setKycData({ ...kycData, otherDetails })
                }
                placeholder="Any additional information..."
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </View>
          )}
        </View>

        <View style={styles.accordionContainer}>
          <Pressable
            style={styles.accordionHeader}
            onPress={() => toggleSection("services")}
          >
            <Text style={styles.accordionTitle}>Services</Text>
            {expandedSection === "services" ? (
              <ChevronDown size={24} color={colors.text.primary} />
            ) : (
              <ChevronRight size={24} color={colors.text.secondary} />
            )}
          </Pressable>
          {expandedSection === "services" && (
            <View style={styles.accordionContent}>
              <Text style={styles.description}>
                Select the services you can provide to patients
              </Text>

              <View style={styles.servicesGrid}>
                {HEALTHCARE_SERVICES.map((service) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <Pressable
                      key={service}
                      style={[
                        styles.serviceChip,
                        isSelected && styles.serviceChipSelected,
                      ]}
                      onPress={() => toggleService(service)}
                    >
                      {isSelected && (
                        <Check
                          size={18}
                          color={colors.primary}
                          style={styles.checkIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.serviceText,
                          isSelected && styles.serviceTextSelected,
                        ]}
                      >
                        {service}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>
                  {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.accordionContainer}>
          <Pressable
            style={styles.accordionHeader}
            onPress={() => toggleSection("pricing")}
          >
            <Text style={styles.accordionTitle}>Pricing</Text>
            {expandedSection === "pricing" ? (
              <ChevronDown size={24} color={colors.text.primary} />
            ) : (
              <ChevronRight size={24} color={colors.text.secondary} />
            )}
          </Pressable>
          {expandedSection === "pricing" && (
            <View style={styles.accordionContent}>
              <Text style={styles.description}>
                Set your pricing model and rates for services
              </Text>

              <View style={styles.modelSection}>
                <Text style={styles.sectionTitle}>Pricing Model</Text>

                <Pressable
                  style={[
                    styles.modelCard,
                    pricingData.model === "fixed" && styles.modelCardSelected,
                  ]}
                  onPress={() => setPricingData({ ...pricingData, model: "fixed" })}
                >
                  <View style={styles.modelHeader}>
                    <View>
                      <Text style={styles.modelTitle}>Fixed Rate</Text>
                      <Text style={styles.modelDescription}>
                        Charge a flat rate per session
                      </Text>
                    </View>
                    {pricingData.model === "fixed" && (
                      <Check size={24} color={colors.primary} />
                    )}
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.modelCard,
                    pricingData.model === "hourly" && styles.modelCardSelected,
                  ]}
                  onPress={() => setPricingData({ ...pricingData, model: "hourly" })}
                >
                  <View style={styles.modelHeader}>
                    <View>
                      <Text style={styles.modelTitle}>Per Hour</Text>
                      <Text style={styles.modelDescription}>
                        Charge based on hours worked
                      </Text>
                    </View>
                    {pricingData.model === "hourly" && (
                      <Check size={24} color={colors.primary} />
                    )}
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.modelCard,
                    pricingData.model === "bespoke" && styles.modelCardSelected,
                  ]}
                  onPress={() => setPricingData({ ...pricingData, model: "bespoke" })}
                >
                  <View style={styles.modelHeader}>
                    <View>
                      <Text style={styles.modelTitle}>Bespoke</Text>
                      <Text style={styles.modelDescription}>
                        Negotiate rate with each client
                      </Text>
                    </View>
                    {pricingData.model === "bespoke" && (
                      <Check size={24} color={colors.primary} />
                    )}
                  </View>
                </Pressable>
              </View>

              {pricingData.model === "fixed" && (
                <View style={styles.rateSection}>
                  <Input
                    label="Fixed Rate (GHS)"
                    value={pricingData.fixedRate}
                    onChangeText={(fixedRate) =>
                      setPricingData({ ...pricingData, fixedRate })
                    }
                    placeholder="200"
                    keyboardType="numeric"
                  />
                </View>
              )}

              {pricingData.model === "hourly" && (
                <View style={styles.rateSection}>
                  <Input
                    label="Hourly Rate (GHS)"
                    value={pricingData.hourlyRate}
                    onChangeText={(hourlyRate) =>
                      setPricingData({ ...pricingData, hourlyRate })
                    }
                    placeholder="50"
                    keyboardType="numeric"
                  />
                </View>
              )}

              {pricingData.model === "bespoke" && (
                <View style={styles.rateSection}>
                  <Text style={styles.sectionTitle}>Rate Range (GHS)</Text>
                  <View style={styles.rangeContainer}>
                    <View style={styles.rangeInput}>
                      <Input
                        label="Minimum"
                        value={pricingData.minRate}
                        onChangeText={(minRate) =>
                          setPricingData({ ...pricingData, minRate })
                        }
                        placeholder="100"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.rangeSeparator}>
                      <Text style={styles.rangeSeparatorText}>to</Text>
                    </View>
                    <View style={styles.rangeInput}>
                      <Input
                        label="Maximum"
                        value={pricingData.maxRate}
                        onChangeText={(maxRate) =>
                          setPricingData({ ...pricingData, maxRate })
                        }
                        placeholder="300"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {expandedSection && (
        <View style={styles.footer}>
          <Button
            title={isSaving ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            disabled={isSaving}
          />
        </View>
      )}

      <Modal visible={showRolePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Role</Text>
            </View>
            <ScrollView style={styles.roleList}>
              {HEALTHCARE_ROLES.map((role) => (
                <Pressable
                  key={role}
                  style={styles.roleItem}
                  onPress={() => {
                    setKycData({ ...kycData, role });
                    setShowRolePicker(false);
                  }}
                >
                  <Text style={styles.roleText}>{role}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowRolePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photoContainer: {
    marginBottom: 16,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.accent,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 40,
  },
  accordionContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  accordionContent: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoEditButton: {
    alignItems: "center",
  },
  photoEditPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  editPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoEditText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  selectText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectPlaceholder: {
    color: colors.text.light,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    minHeight: 180,
    justifyContent: "center",
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  idPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderWidth: 0,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 6,
  },
  serviceChipSelected: {
    backgroundColor: colors.card.mint,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  checkIcon: {
    marginRight: 2,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.text.secondary,
  },
  serviceTextSelected: {
    color: colors.primary,
    fontWeight: "600" as const,
  },
  selectedCount: {
    padding: 18,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    alignItems: "center",
  },
  selectedCountText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  modelSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  modelCard: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modelCardSelected: {
    backgroundColor: colors.primaryLight + "10",
    borderColor: colors.primary,
  },
  modelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  rateSection: {
    marginTop: 8,
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    paddingTop: 28,
  },
  rangeSeparatorText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: colors.text.primary,
    textAlign: "center",
  },
  roleList: {
    maxHeight: 400,
  },
  roleItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  roleText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 0,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  testButton: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  testButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  testButtonText: {
    flex: 1,
  },
  testButtonTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  testButtonDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
