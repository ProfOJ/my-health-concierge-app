import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { CheckCircle } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SessionScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSection}>
          <View style={styles.iconContainer}>
            <CheckCircle size={64} color={colors.success} />
          </View>
          <Text style={styles.statusTitle}>Request Sent!</Text>
          <Text style={styles.statusDescription}>
            Waiting for a health assistant to accept your request...
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>
                A health assistant will review and accept your request
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>
                You&apos;ll be able to chat with them once accepted
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>
                They&apos;ll guide you through your hospital visit
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Open Chat"
          onPress={() => console.log("Open chat")}
          variant="secondary"
          disabled
        />
        <Button
          title="Complete Session"
          onPress={() => console.log("Complete")}
          disabled
        />
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
  statusSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  statusDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  infoCard: {
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
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    gap: 12,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 12,
  },
});
