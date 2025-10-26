import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "expo-router";
import { Briefcase, Clock, Users, Settings } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AssistantDashboard() {
  const { assistantProfile } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const stats = {
    hoursInService: 47,
    patientsServed: 23,
    activeSessions: 0,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.name}>{assistantProfile?.name || "Health Assistant"}</Text>
        </View>
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push("/assistant/profile")}
        >
          <Settings size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card.lavender }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.lavenderLight }]}>
                <Clock size={28} color={colors.lavenderDark} />
              </View>
              <Text style={styles.statValue}>{stats.hoursInService}</Text>
              <Text style={styles.statLabel}>Hours in Service</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card.mint }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.accentLight }]}>
                <Users size={28} color={colors.accentDark} />
              </View>
              <Text style={styles.statValue}>{stats.patientsServed}</Text>
              <Text style={styles.statLabel}>Patients Served</Text>
            </View>
          </View>
        </View>

        {stats.activeSessions === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Briefcase size={40} color={colors.text.light} />
            </View>
            <Text style={styles.emptyTitle}>No active sessions</Text>
            <Text style={styles.emptyDescription}>
              Go live to start accepting patient requests
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>Live Sessions</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/assistant/sessions")}
        >
          <Briefcase size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Sessions</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/assistant/go-live")}
        >
          <View style={styles.goLiveButton}>
            <Text style={styles.goLiveText}>Go{"\n"}Live</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/assistant/profile")}
        >
          <Users size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.background.cream,
    borderBottomWidth: 0,
  },
  greeting: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  impactSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
  },
  sessionsSection: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: colors.card.cream,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderTopWidth: 0,
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.text.secondary,
  },
  goLiveButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  goLiveText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: colors.text.inverse,
    textAlign: "center",
    lineHeight: 20,
  },
});
