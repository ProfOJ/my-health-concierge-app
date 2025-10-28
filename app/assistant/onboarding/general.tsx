import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useApp } from "@/contexts/AppContext";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import { trpcClient } from "@/lib/trpc";

export default function GeneralInfoScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { saveAssistantProfile } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

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

  const checkExistingAssistant = async (): Promise<boolean> => {
    if (!formData.email && !formData.phone) return false;

    setIsCheckingExisting(true);
    try {
      console.log("🔍 Checking for existing assistant...");
      const result = await trpcClient.assistants.checkExisting.query({
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });

      if (result.exists && result.assistant) {
        console.log("✅ Found existing assistant, logging in...");
        
        return new Promise((resolve) => {
          Alert.alert(
            "Welcome Back!",
            `Found existing profile for ${result.assistant.name}. Logging you in...`,
            [
              {
                text: "OK",
                onPress: async () => {
                  try {
                    const fullData = await trpcClient.assistants.getAssistantData.query({
                      assistantId: result.assistant.id,
                    });

                    await saveAssistantProfile(
                      {
                        ...fullData.assistant,
                        rateRange: fullData.assistant.rateMin && fullData.assistant.rateMax
                          ? { min: fullData.assistant.rateMin, max: fullData.assistant.rateMax }
                          : undefined,
                      },
                      true
                    );

                    console.log("✅ Profile loaded, redirecting to dashboard...");
                    router.replace("/assistant/dashboard");
                    resolve(true);
                  } catch (error) {
                    console.error("❌ Error loading assistant data:", error);
                    Alert.alert(
                      "Error",
                      "Failed to load your profile data. Please try again.",
                      [{ text: "OK" }]
                    );
                    resolve(false);
                  }
                },
              },
            ]
          );
        });
      }
      return false;
    } catch (error) {
      console.error("❌ Error checking for existing assistant:", error);
      return false;
    } finally {
      setIsCheckingExisting(false);
    }
  };

  const handleContinue = async () => {
    const foundExisting = await checkExistingAssistant();
    
    if (!foundExisting) {
      await updateOnboardingData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        photo: formData.photo,
      });
      router.push("/assistant/onboarding/kyc");
    }
  };

  const isValid =
    formData.name && formData.email && formData.phone && formData.address && formData.photo;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/user-type")}
              style={{ marginLeft: -8 }}
            >
              <ArrowLeft size={24} color={colors.text.primary} />
            </Pressable>
          ),
        }}
      />
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
        {isCheckingExisting && (
          <View style={styles.checkingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.checkingText}>Checking for existing profile...</Text>
          </View>
        )}
        <Button 
          title="Continue" 
          onPress={handleContinue} 
          disabled={!isValid || isCheckingExisting} 
        />
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
  checkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  checkingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
