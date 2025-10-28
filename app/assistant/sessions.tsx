import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "expo-router";
import { Briefcase, Check, Clock, Search, User, X, Home, Package, Eye, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { trpc } from "@/lib/trpc";

type FilterType = "all" | "pending" | "ongoing" | "completed" | "open";

type HospitalSession = {
  id: string;
  patient_name: string;
  hospital_name: string;
  special_service?: string;
  status: string;
  created_at: string;
  estimated_arrival: string;
  requester_name: string;
  is_requester_patient: boolean;
};

type HomeCareRequest = {
  id: string;
  patient_name?: string;
  requester_name: string;
  address: string;
  services: string[];
  status: string;
  created_at: string;
  is_patient: boolean;
};

type HealthSuppliesRequest = {
  id: string;
  requester_name: string;
  recipient_name?: string;
  recipient_type: string;
  what_needed?: string;
  urgency: string;
  status: string;
  created_at: string;
  delivery_address: string;
};

type UnifiedRequest = {
  id: string;
  type: "hospital" | "home_care" | "health_supplies";
  title: string;
  subtitle: string;
  location: string;
  status: string;
  createdAt: string;
  estimatedArrival?: string;
  requesterName: string;
};

type RequestTypeLabel = {
  label: string;
  color: string;
  icon: typeof Home;
};

export default function SessionsScreen() {
  const { sessions, updateSession, refreshSessions } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("open");

  const { data: openRequestsData, isLoading, refetch } = trpc.requests.getAllOpen.useQuery();

  useEffect(() => {
    refreshSessions();
    refetch();
  }, [refreshSessions, refetch]);

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

  const mapToUnifiedRequests = (): UnifiedRequest[] => {
    if (!openRequestsData) return [];

    const unified: UnifiedRequest[] = [];

    openRequestsData.hospitalSessions.forEach((session: HospitalSession) => {
      unified.push({
        id: session.id,
        type: "hospital",
        title: session.patient_name,
        subtitle: session.special_service || "Hospital Assistance",
        location: session.hospital_name,
        status: session.status,
        createdAt: session.created_at,
        estimatedArrival: session.estimated_arrival,
        requesterName: session.requester_name,
      });
    });

    openRequestsData.homeCareRequests.forEach((request: HomeCareRequest) => {
      unified.push({
        id: request.id,
        type: "home_care",
        title: request.patient_name || request.requester_name,
        subtitle: request.services.join(", "),
        location: request.address,
        status: request.status,
        createdAt: request.created_at,
        requesterName: request.requester_name,
      });
    });

    openRequestsData.healthSuppliesRequests.forEach((request: HealthSuppliesRequest) => {
      unified.push({
        id: request.id,
        type: "health_supplies",
        title: request.recipient_name || request.requester_name,
        subtitle: request.what_needed || `Health Supplies (${request.urgency})`,
        location: request.delivery_address,
        status: request.status,
        createdAt: request.created_at,
        requesterName: request.requester_name,
      });
    });

    return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getFilteredSessions = () => {
    let filtered = sessions;

    switch (activeFilter) {
      case "pending":
        filtered = sessions.filter((s) => s.status === "pending");
        break;
      case "ongoing":
        filtered = sessions.filter((s) => s.status === "accepted");
        break;
      case "completed":
        filtered = sessions.filter((s) => s.status === "completed");
        break;
      case "open":
        return mapToUnifiedRequests();
      case "all":
      default:
        filtered = sessions.filter((s) => s.status !== "declined");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.requesterName.toLowerCase().includes(query) ||
          s.patientName?.toLowerCase().includes(query) ||
          s.hospitalName?.toLowerCase().includes(query) ||
          s.specialService?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredData = getFilteredSessions();
  const isOpenFilter = activeFilter === "open";
  const isUnifiedList = Array.isArray(filteredData) && filteredData.length > 0 && "type" in filteredData[0];
  
  const getRequestIcon = (type: string) => {
    switch (type) {
      case "home_care":
        return <Home size={24} color={colors.primary} />;
      case "health_supplies":
        return <Package size={24} color={colors.primary} />;
      default:
        return <User size={24} color={colors.primary} />;
    }
  };

  const getRequestTypeLabel = (type: string): RequestTypeLabel => {
    switch (type) {
      case "home_care":
        return { label: "Home Care", color: "#6366F1", icon: Home };
      case "health_supplies":
        return { label: "Health Supplies", color: "#10B981", icon: Package };
      default:
        return { label: "Hospital Assistance", color: "#F59E0B", icon: User };
    }
  };

  const handleViewRequest = (request: UnifiedRequest) => {
    console.log("Viewing request:", request.id, request.type);
  };

  const handleAcceptRequest = (request: UnifiedRequest) => {
    console.log("Accepting request:", request.id, request.type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return colors.accent;
      case "accepted":
      case "assigned":
      case "processing":
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  const filters: { type: FilterType; label: string }[] = [
    { type: "all", label: "All" },
    { type: "pending", label: "My Pending" },
    { type: "ongoing", label: "Ongoing" },
    { type: "completed", label: "Completed" },
    { type: "open", label: "All Open Requests" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchFilterSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions..."
            placeholderTextColor={colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <Pressable
              key={filter.type}
              style={({ pressed }) => [
                styles.filterChip,
                activeFilter === filter.type && styles.filterChipActive,
                pressed && styles.filterChipPressed,
              ]}
              onPress={() => setActiveFilter(filter.type)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.type && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Briefcase size={40} color={colors.text.light} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery || activeFilter !== "all"
                ? "No sessions found"
                : "No sessions yet"}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchQuery || activeFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Your session requests will appear here"}
            </Text>
          </View>
        ) : isOpenFilter && isUnifiedList ? (
          <View style={styles.sessionsList}>
            {(filteredData as UnifiedRequest[]).map((request) => {
              const typeLabel = getRequestTypeLabel(request.type);
              return (
                <View
                  key={request.id}
                  style={styles.sessionCard}
                >
                  <View style={[styles.requestTypeBadge, { backgroundColor: `${typeLabel.color}15` }]}>
                    <Text style={[styles.requestTypeText, { color: typeLabel.color }]}>
                      {typeLabel.label}
                    </Text>
                  </View>

                  <View style={styles.sessionHeader}>
                    <View style={styles.userIcon}>
                      {getRequestIcon(request.type)}
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.requesterName}>
                        {request.requesterName}
                      </Text>
                      {request.title !== request.requesterName && (
                        <Text style={styles.patientName}>
                          {request.title}
                        </Text>
                      )}
                      <Text style={styles.specialService}>
                        {request.subtitle}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sessionDetails}>
                    <View style={styles.detailRow}>
                      <Clock size={16} color={colors.text.secondary} />
                      <Text style={styles.detailText}>
                        {request.location}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={16} color={colors.text.secondary} />
                      <Text style={styles.detailText}>
                        {getTimeAgo(request.createdAt)}
                      </Text>
                    </View>
                    {request.estimatedArrival && (
                      <View style={styles.detailRow}>
                        <Clock size={16} color={colors.accent} />
                        <Text style={[styles.detailText, styles.etaText]}>
                          ETA: {getETA(request.estimatedArrival)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.requestActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.iconButton,
                        styles.acceptIconButton,
                        pressed && styles.iconButtonPressed,
                      ]}
                      onPress={() => handleAcceptRequest(request)}
                    >
                      <CheckCircle size={20} color={colors.text.inverse} />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.iconButton,
                        styles.viewIconButton,
                        pressed && styles.iconButtonPressed,
                      ]}
                      onPress={() => handleViewRequest(request)}
                    >
                      <Eye size={20} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {(filteredData as typeof sessions).map((session) => (
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
  searchFilterSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipPressed: {
    opacity: 0.7,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  requestTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  requestTypeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  acceptIconButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  viewIconButton: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.medium,
  },
  iconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
