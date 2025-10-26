import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ReviewScreen() {
  const { saveAssistantProfile } = useApp();
  const router = useRouter();

  const handleSubmit = async () => {
    const mockProfile = {
      id: "",
      name: "John Doe",
      email: "john@example.com",
      phone: "+233 XX XXX XXXX",
      address: "Accra, Ghana",
      photo: "",
      role: "Registered Nurse",
      idPhoto: "",
      otherDetails: "",
      services: ["General Care", "Patient Escort"],
      pricingModel: "hourly" as const,
      rate: 50,
      verificationStatus: "pending" as const,
    };

    await saveAssistantProfile(mockProfile);
    router.replace("/assistant/dashboard");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color={colors.success} />
        </View>

        <Text style={styles.title}>Application Complete!</Text>
        <Text style={styles.description}>
          Your application has been submitted for verification. We&apos;ll review your
          credentials and notify you once approved.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Our team reviews your application (1-2 business days)
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                You&apos;ll receive an email notification once approved
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Start accepting sessions and helping patients!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Go to Dashboard" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: "row",
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: colors.text.inverse,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    paddingTop: 3,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
