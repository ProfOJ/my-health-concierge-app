import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Home, Hospital, Pill, ChevronRight, ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ServiceType = "home-care" | "hospital-assistance" | "health-supplies";

export default function ServiceTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelectService = (serviceType: ServiceType) => {
    if (serviceType === "home-care") {
      router.push("/patient/home-care");
    } else if (serviceType === "health-supplies") {
      router.push("/patient/health-supplies");
    } else {
      router.push("/patient/hospital-select");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/user-type")}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <Text style={styles.title}>How may we help you?</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [
            styles.serviceCard,
            pressed && styles.serviceCardPressed,
          ]}
          onPress={() => handleSelectService("home-care")}
        >
          <View style={[styles.iconContainer, styles.homeIconBg]}>
            <Home size={28} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={styles.serviceText}>Home Care</Text>
          <ChevronRight size={24} color={colors.text.light} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.serviceCard,
            pressed && styles.serviceCardPressed,
          ]}
          onPress={() => handleSelectService("hospital-assistance")}
        >
          <View style={[styles.iconContainer, styles.hospitalIconBg]}>
            <Hospital size={28} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={styles.serviceText}>Hospital Assistance</Text>
          <ChevronRight size={24} color={colors.text.light} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.serviceCard,
            pressed && styles.serviceCardPressed,
          ]}
          onPress={() => handleSelectService("health-supplies")}
        >
          <View style={[styles.iconContainer, styles.suppliesIconBg]}>
            <Pill size={28} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={styles.serviceText}>Health Supplies</Text>
          <ChevronRight size={24} color={colors.text.light} />
        </Pressable>

        <View style={styles.serviceCard}>
          <View style={[styles.iconContainer, styles.comingSoonIconBg]}>
            <Text style={styles.comingSoonIcon}>+</Text>
          </View>
          <Text style={styles.serviceTextDisabled}>More options coming soon</Text>
          <View style={styles.iconPlaceholder} />
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
    borderBottomWidth: 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  scrollContent: {
    padding: 24,
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  serviceCardPressed: {
    backgroundColor: colors.background.secondary,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  homeIconBg: {
    backgroundColor: colors.card.mint,
  },
  hospitalIconBg: {
    backgroundColor: colors.card.lavender,
  },
  suppliesIconBg: {
    backgroundColor: colors.card.peach,
  },
  comingSoonIconBg: {
    backgroundColor: colors.background.secondary,
  },
  comingSoonIcon: {
    fontSize: 32,
    fontWeight: "300" as const,
    color: colors.text.light,
  },
  serviceText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  serviceTextDisabled: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.light,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
  },
});
