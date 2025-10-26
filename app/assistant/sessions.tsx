import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { mockSessions } from "@/constants/mockSessions";
import { useRouter } from "expo-router";
import { Briefcase, Check, Clock, User, X } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function SessionsScreen() {
  const { sessions, updateSession, addSession } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (sessions.length === 0) {
      mockSessions.forEach((session) => addSession(session));
    }
  }, []);

  const handleAccept = (sessionId: string) => {
    updateSession(sessionId, {
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    });
    router.push(`/assistant/session-detail?id=${sessionId}`);
  };

  const handleReject = (sessionId: string) => {
    updateSession(sessionId, { status: "declined" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const time = new Date(dateString).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 min ago";
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  const getETA = (dateString: string) => {
    const now = Date.now();
    const eta = new Date(dateString).getTime();
    const diff = eta - now;
    const minutes = Math.floor(diff / 60000);

    if (minutes <= 0) return "Arrived";
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) return `${hours} hr`;
    return `${hours}h ${remainingMins}m`;
  };

  const activeSessions = sessions.filter(
    (s) => s.status !== "completed" && s.status !== "declined"
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Briefcase size={40} color={colors.text.light} />
            </View>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptyDescription}>
              Your session requests will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {activeSessions.map((session) => (
              <Pressable
                key={session.id}
                style={({ pressed }) => [
                  styles.sessionCard,
                  pressed && styles.sessionCardPressed,
                ]}
                onPress={() => {
                  if (session.status === "accepted") {
                    router.push(`/assistant/session-detail?id=${session.id}`);
                  }
                }}
              >
                <View style={styles.sessionHeader}>
                  <View style={styles.userIcon}>
                    <User size={24} color={colors.primary} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.requesterName}>
                      {session.requesterName}
                    </Text>
                    {!session.isRequesterPatient && (
                      <Text style={styles.patientName}>
                        Patient: {session.patientName}
                      </Text>
                    )}
                    {session.specialService && (
                      <Text style={styles.specialService}>
                        {session.specialService}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.sessionDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={16} color={colors.text.secondary} />
                    <Text style={styles.detailText}>
                      Requested: {getTimeAgo(session.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={16} color={colors.accent} />
                    <Text style={[styles.detailText, styles.etaText]}>
                      ETA: {getETA(session.estimatedArrival)}
                    </Text>
                  </View>
                </View>

                {session.status === "pending" && (
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButton,
                        styles.acceptButton,
                        pressed && styles.actionButtonPressed,
                      ]}
                      onPress={() => handleAccept(session.id)}
                    >
                      <Check size={24} color={colors.text.inverse} />
                      <Text style={styles.acceptText}>Accept</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButton,
                        styles.rejectButton,
                        pressed && styles.actionButtonPressed,
                      ]}
                      onPress={() => handleReject(session.id)}
                    >
                      <X size={24} color={colors.error} />
                      <Text style={styles.rejectText}>Decline</Text>
                    </Pressable>
                  </View>
                )}

                {session.status === "accepted" && (
                  <View style={styles.statusBadge}>
                    <View
                      style={[styles.statusDot, styles.statusDotAccepted]}
                    />
                    <Text style={styles.statusText}>Accepted</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
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
  emptyState: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: 40,
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
  sessionsList: {
    gap: 16,
  },
  sessionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border.light,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  specialService: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600" as const,
  },
  sessionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  etaText: {
    color: colors.accent,
    fontWeight: "600" as const,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colors.accent,
  },
  rejectButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.inverse,
  },
  rejectText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.error,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotAccepted: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.success,
  },
});
