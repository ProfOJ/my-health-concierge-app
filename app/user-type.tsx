import { useApp } from "@/contexts/AppContext";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Briefcase, User } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UserTypeScreen() {
  const { selectUserType } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelectAssistant = async () => {
    await selectUserType("assistant");
    router.replace("/assistant/onboarding/general");
  };

  const handleSelectPatient = async () => {
    await selectUserType("patient");
    router.replace("/patient/hospital-select");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>How do you want to continue?</Text>
          <Text style={styles.subtitle}>Choose your role to get started</Text>
        </View>

        <View style={styles.options}>
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed,
            ]}
            onPress={handleSelectAssistant}
          >
            <View style={[styles.iconContainer, styles.assistantIconBg]}>
              <Briefcase size={40} color={colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.optionTitle}>Health Assistant</Text>
            <Text style={styles.optionDescription}>
              Offer your services to help patients navigate hospital visits
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed,
            ]}
            onPress={handleSelectPatient}
          >
            <View style={[styles.iconContainer, styles.patientIconBg]}>
              <User size={40} color={colors.accent} strokeWidth={2.5} />
            </View>
            <Text style={styles.optionTitle}>Patient / User</Text>
            <Text style={styles.optionDescription}>
              Book a health assistant for your hospital visit
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.lavender,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text.secondary,
    textAlign: "center",
  },
  options: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  assistantIconBg: {
    backgroundColor: colors.card.mint,
  },
  patientIconBg: {
    backgroundColor: colors.card.lavender,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
