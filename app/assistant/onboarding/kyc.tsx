import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { HEALTHCARE_ROLES } from "@/constants/assistants";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ChevronDown, Upload } from "lucide-react-native";
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

export default function KYCScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: "",
    idPhoto: "",
    otherDetails: "",
  });
  const [showRolePicker, setShowRolePicker] = useState(false);

  const pickIdPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as const,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, idPhoto: result.assets[0].uri });
    }
  };

  const handleContinue = () => {
    router.push("/assistant/onboarding/services");
  };

  const isValid = formData.role && formData.idPhoto;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Verify your credentials to ensure trust and safety
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>I am a...</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowRolePicker(true)}
          >
            <Text
              style={[
                styles.selectText,
                !formData.role && styles.selectPlaceholder,
              ]}
            >
              {formData.role || "Select your role"}
            </Text>
            <ChevronDown size={20} color={colors.text.secondary} />
          </Pressable>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.label}>Upload Photo of ID</Text>
          <Pressable style={styles.uploadButton} onPress={pickIdPhoto}>
            {formData.idPhoto ? (
              <Image source={{ uri: formData.idPhoto }} style={styles.idPhoto} />
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Upload size={28} color={colors.primary} />
                </View>
                <Text style={styles.uploadText}>Tap to upload ID</Text>
                <Text style={styles.uploadHint}>Ghana Card, Passport, or Driver&apos;s License</Text>
              </>
            )}
          </Pressable>
        </View>

        <Input
          label="Other Details (Optional)"
          value={formData.otherDetails}
          onChangeText={(otherDetails) =>
            setFormData({ ...formData, otherDetails })
          }
          placeholder="Any additional information..."
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} disabled={!isValid} />
      </View>

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
                    setFormData({ ...formData, role });
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
    backgroundColor: colors.background.lavender,
  },
  scrollContent: {
    padding: 24,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
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
    backgroundColor: colors.background.primary,
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
    backgroundColor: colors.background.primary,
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
  uploadHint: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  idPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 0,
    backgroundColor: colors.background.lavender,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
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
});
