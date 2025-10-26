import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function GeneralInfoScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });

  useEffect(() => {
    if (onboardingData.name) setFormData(prev => ({ ...prev, name: onboardingData.name || "" }));
    if (onboardingData.email) setFormData(prev => ({ ...prev, email: onboardingData.email || "" }));
    if (onboardingData.phone) setFormData(prev => ({ ...prev, phone: onboardingData.phone || "" }));
    if (onboardingData.address) setFormData(prev => ({ ...prev, address: onboardingData.address || "" }));
    if (onboardingData.photo) setFormData(prev => ({ ...prev, photo: onboardingData.photo || "" }));
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as const,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photo: result.assets[0].uri });
    }
  };

  const handleContinue = async () => {
    await updateOnboardingData({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      photo: formData.photo,
    });
    router.push("/assistant/onboarding/kyc");
  };

  const isValid =
    formData.name && formData.email && formData.phone && formData.address && formData.photo;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoSection}>
          <Pressable style={styles.photoButton} onPress={pickImage}>
            {formData.photo ? (
              <Image source={{ uri: formData.photo }} style={styles.photo} />
            ) : (
              <>
                <View style={styles.photoPlaceholder}>
                  <Camera size={32} color={colors.text.secondary} />
                </View>
                <Text style={styles.photoText}>Add Photo</Text>
              </>
            )}
          </Pressable>
        </View>

        <Input
          label="Full Name"
          value={formData.name}
          onChangeText={(name) => setFormData({ ...formData, name })}
          placeholder="Enter your full name"
        />

        <Input
          label="Email Address"
          value={formData.email}
          onChangeText={(email) => setFormData({ ...formData, email })}
          placeholder="your.email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={(phone) => setFormData({ ...formData, phone })}
          placeholder="+233 XX XXX XXXX"
          keyboardType="phone-pad"
        />

        <Input
          label="Address"
          value={formData.address}
          onChangeText={(address) => setFormData({ ...formData, address })}
          placeholder="Enter your address"
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} disabled={!isValid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.mint,
  },
  scrollContent: {
    padding: 24,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  photoButton: {
    alignItems: "center",
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: colors.background.mint,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
});
