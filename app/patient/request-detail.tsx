import colors from "@/constants/colors";
import { api } from "@/lib/api";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  Clock,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Stethoscope,
  User,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RequestType = "hospital" | "home-care" | "health-supplies";

interface RequestDetail {
  id: string;
  type: RequestType;
  status: string;
  created_at: string;
  accepted_at?: string;
  hospital_name?: string;
  services?: string[];
  address?: string;
  delivery_address?: string;
  requester_name?: string;
  requester_contact?: string;
  patient_name?: string;
  patient_gender?: string;
  patient_age_range?: string;
  patient_age?: string;
  urgency?: string;
  has_prescription?: boolean;
  what_needed?: string;
  notes?: string;
}

export default function RequestDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: RequestType }>();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRequestDetail = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = "";

      switch (type) {
        case "hospital":
          endpoint = `/hospital_sessions?id=eq.${id}`;
          break;
        case "home-care":
          endpoint = `/home_care_requests?id=eq.${id}`;
          break;
        case "health-supplies":
          endpoint = `/health_supplies_requests?id=eq.${id}`;
          break;
      }

      const { data } = await api.get(endpoint);
      if (data && data.length > 0) {
        setRequest({
          ...data[0],
          type,
        });
      }
    } catch (error) {
      console.error("Error loading request detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    loadRequestDetail();
  }, [loadRequestDetail]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleCall = () => {
    Linking.openURL("tel:0503516739");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/233503516739");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Request not found</Text>
      </View>
    );
  }

  const getTypeIcon = () => {
    switch (type) {
      case "hospital":
        return <Stethoscope size={32} color={colors.primary} />;
      case "home-care":
        return <Home size={32} color={colors.lavenderDark} />;
      case "health-supplies":
        return <Package size={32} color={colors.accent} />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "hospital":
        return "Hospital Assistance";
      case "home-care":
        return "Home Care Service";
      case "health-supplies":
        return "Health Supplies";
    }
  };

  const getStatusColor = () => {
    if (["pending", "processing"].includes(request.status)) {
      return colors.warning;
    }
    if (
      ["accepted", "assigned", "in-progress", "out-for-delivery"].includes(
        request.status
      )
    ) {
      return colors.accent;
    }
    return colors.success;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Request Details",
          headerStyle: { backgroundColor: colors.background.primary },
          headerTintColor: colors.text.primary,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>{getTypeIcon()}</View>
            <Text style={styles.headerTitle}>{getTypeLabel()}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() + "20" },
              ]}
            >
              <Text
                style={[styles.statusText, { color: getStatusColor() }]}
              >
                {request.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {type === "hospital" && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hospital Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <MapPin size={18} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Hospital:</Text>
                    <Text style={styles.infoValue}>
                      {request.hospital_name}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <User size={18} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>
                      {request.patient_name}
                    </Text>
                  </View>
                  {request.patient_gender && (
                    <View style={styles.infoRow}>
                      <User size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Gender:</Text>
                      <Text style={styles.infoValue}>
                        {request.patient_gender}
                      </Text>
                    </View>
                  )}
                  {request.patient_age_range && (
                    <View style={styles.infoRow}>
                      <User size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Age:</Text>
                      <Text style={styles.infoValue}>
                        {request.patient_age_range}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {type === "home-care" && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Details</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <FileText size={18} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Services:</Text>
                    <Text style={styles.infoValue}>
                      {request.services?.join(", ")}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={18} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Location:</Text>
                    <Text style={styles.infoValue}>{request.address}</Text>
                  </View>
                  {request.patient_name && (
                    <View style={styles.infoRow}>
                      <User size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Patient:</Text>
                      <Text style={styles.infoValue}>
                        {request.patient_name}
                      </Text>
                    </View>
                  )}
                  {request.patient_gender && (
                    <View style={styles.infoRow}>
                      <User size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Gender:</Text>
                      <Text style={styles.infoValue}>
                        {request.patient_gender}
                      </Text>
                    </View>
                  )}
                  {request.patient_age && (
                    <View style={styles.infoRow}>
                      <User size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Age:</Text>
                      <Text style={styles.infoValue}>
                        {request.patient_age}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {type === "health-supplies" && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Details</Text>
                <View style={styles.infoCard}>
                  {request.has_prescription && (
                    <View style={styles.infoRow}>
                      <FileText size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Prescription:</Text>
                      <Text style={styles.infoValue}>Yes</Text>
                    </View>
                  )}
                  {request.what_needed && (
                    <View style={styles.infoRow}>
                      <Package size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Items:</Text>
                      <Text style={styles.infoValue}>
                        {request.what_needed}
                      </Text>
                    </View>
                  )}
                  {request.urgency && (
                    <View style={styles.infoRow}>
                      <Clock size={18} color={colors.text.secondary} />
                      <Text style={styles.infoLabel}>Urgency:</Text>
                      <Text style={styles.infoValue}>
                        {request.urgency}
                      </Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <MapPin size={18} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Delivery:</Text>
                    <Text style={styles.infoValue}>
                      {request.delivery_address}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Clock size={18} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Requested:</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(request.created_at)}
                </Text>
              </View>
              {request.accepted_at && (
                <View style={styles.infoRow}>
                  <Clock size={18} color={colors.accent} />
                  <Text style={styles.infoLabel}>Accepted:</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(request.accepted_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {request.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.infoCard}>
                <Text style={styles.notesText}>{request.notes}</Text>
              </View>
            </View>
          )}

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Need Help?</Text>
            <Text style={styles.contactText}>
              Call or WhatsApp us anytime for updates
            </Text>
            <View style={styles.contactButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.contactButton,
                  styles.callButton,
                  pressed && styles.contactButtonPressed,
                ]}
                onPress={handleCall}
              >
                <Phone size={20} color={colors.text.inverse} />
                <Text style={styles.contactButtonText}>Call</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.contactButton,
                  styles.whatsappButton,
                  pressed && styles.contactButtonPressed,
                ]}
                onPress={handleWhatsApp}
              >
                <MessageCircle size={20} color={colors.text.inverse} />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.background.lavender,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: "600" as const,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  notesText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  contactSection: {
    marginTop: 8,
    padding: 20,
    backgroundColor: colors.background.mint,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  contactText: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: "center",
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: colors.primary,
  },
  whatsappButton: {
    backgroundColor: colors.accent,
  },
  contactButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: colors.text.inverse,
  },
});
