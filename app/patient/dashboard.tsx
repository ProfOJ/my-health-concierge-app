import colors from "@/constants/colors";
import { api } from "@/lib/api";
import { useRouter } from "expo-router";
import {
  Calendar,
  CheckCircle,
  Clock,
  Home,
  Package,
  Stethoscope,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RequestType = "hospital" | "home-care" | "health-supplies";
type RequestStatus = "pending" | "ongoing" | "completed";

interface Request {
  id: string;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  hospital_name?: string;
  services?: string[];
  address?: string;
  delivery_address?: string;
  accepted_at?: string;
  completed_at?: string;
  delivered_at?: string;
}

export default function PatientDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [profileId, setProfileId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);

      const storedPhone = "DEMO_USER";
      let currentProfileId = profileId;

      if (!currentProfileId) {
        const { data: profiles } = await api.get(
          `/profiles?phone=eq.${storedPhone}`
        );
        if (profiles && profiles.length > 0) {
          currentProfileId = profiles[0].id;
          setProfileId(currentProfileId);
        }
      }

      if (!currentProfileId) {
        setLoading(false);
        return;
      }

      const [hospitalRes, homeCareRes, healthSuppliesRes] = await Promise.all([
        api.get(`/hospital_sessions?order=created_at.desc`),
        api.get(
          `/home_care_requests?profile_id=eq.${currentProfileId}&order=created_at.desc`
        ),
        api.get(
          `/health_supplies_requests?profile_id=eq.${currentProfileId}&order=created_at.desc`
        ),
      ]);

      const allRequests: Request[] = [
        ...(hospitalRes.data || []).map((r: any) => ({
          id: r.id,
          type: "hospital" as RequestType,
          status: mapStatus(r.status),
          created_at: r.created_at,
          hospital_name: r.hospital_name,
          accepted_at: r.accepted_at,
          completed_at: r.completed_at,
        })),
        ...(homeCareRes.data || []).map((r: any) => ({
          id: r.id,
          type: "home-care" as RequestType,
          status: mapStatus(r.status),
          created_at: r.created_at,
          address: r.address,
          services: r.services,
          accepted_at: r.accepted_at,
          completed_at: r.completed_at,
        })),
        ...(healthSuppliesRes.data || []).map((r: any) => ({
          id: r.id,
          type: "health-supplies" as RequestType,
          status: mapStatus(r.status),
          created_at: r.created_at,
          delivery_address: r.delivery_address,
          accepted_at: r.processed_at,
          completed_at: r.delivered_at,
        })),
      ];

      allRequests.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRequests(allRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const mapStatus = (status: string): RequestStatus => {
    if (
      ["pending", "processing"].includes(status)
    ) {
      return "pending";
    }
    if (
      ["accepted", "assigned", "in-progress", "out-for-delivery"].includes(
        status
      )
    ) {
      return "ongoing";
    }
    return "completed";
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "ongoing":
        return colors.accent;
      case "completed":
        return colors.success;
    }
  };

  const getTypeIcon = (type: RequestType) => {
    switch (type) {
      case "hospital":
        return <Stethoscope size={24} color={colors.primary} />;
      case "home-care":
        return <Home size={24} color={colors.lavenderDark} />;
      case "health-supplies":
        return <Package size={24} color={colors.accent} />;
    }
  };

  const getTypeLabel = (type: RequestType) => {
    switch (type) {
      case "hospital":
        return "Hospital Assistance";
      case "home-care":
        return "Home Care";
      case "health-supplies":
        return "Health Supplies";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleRequestPress = (request: Request) => {
    if (request.status === "ongoing") {
      router.push(
        `/patient/request-detail?id=${request.id}&type=${request.type}`
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
        <Text style={styles.headerSubtitle}>Track all your healthcare requests</Text>
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterButton,
            filter === "pending" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "pending" && styles.filterTextActive,
            ]}
          >
            Pending
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterButton,
            filter === "ongoing" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("ongoing")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "ongoing" && styles.filterTextActive,
            ]}
          >
            Ongoing
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterButton,
            filter === "completed" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "completed" && styles.filterTextActive,
            ]}
          >
            Completed
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Clock size={64} color={colors.text.light} />
              <Text style={styles.emptyTitle}>No requests found</Text>
              <Text style={styles.emptyText}>
                {filter === "all"
                  ? "You haven't made any requests yet"
                  : `No ${filter} requests at the moment`}
              </Text>
            </View>
          ) : (
            filteredRequests.map((request) => (
              <Pressable
                key={request.id}
                style={({ pressed }) => [
                  styles.requestCard,
                  pressed && request.status === "ongoing" && styles.requestCardPressed,
                ]}
                onPress={() => handleRequestPress(request)}
                disabled={request.status !== "ongoing"}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestIcon}>{getTypeIcon(request.type)}</View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestType}>
                      {getTypeLabel(request.type)}
                    </Text>
                    {request.hospital_name && (
                      <Text style={styles.requestSubtext}>
                        {request.hospital_name}
                      </Text>
                    )}
                    {request.services && request.services.length > 0 && (
                      <Text style={styles.requestSubtext}>
                        {request.services.join(", ")}
                      </Text>
                    )}
                    {request.address && (
                      <Text style={styles.requestSubtext} numberOfLines={1}>
                        {request.address}
                      </Text>
                    )}
                    {request.delivery_address && (
                      <Text style={styles.requestSubtext} numberOfLines={1}>
                        {request.delivery_address}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(request.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(request.status) },
                      ]}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestFooter}>
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color={colors.text.secondary} />
                    <Text style={styles.dateText}>
                      {formatDate(request.created_at)}
                    </Text>
                  </View>
                  {request.status === "ongoing" && (
                    <Text style={styles.tapToView}>Tap to view details</Text>
                  )}
                  {request.status === "completed" && (
                    <View style={styles.completedIndicator}>
                      <CheckCircle size={14} color={colors.success} />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
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
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: colors.background.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
    gap: 12,
  },
  requestCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  requestIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  requestInfo: {
    flex: 1,
    gap: 4,
  },
  requestType: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  requestSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "capitalize",
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  tapToView: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.accent,
  },
  completedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.success,
  },
});
