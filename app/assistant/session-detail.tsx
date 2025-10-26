import colors from "@/constants/colors";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useApp } from "@/contexts/AppContext";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Mic,
  Shield,
  User,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions, updateSession, assistantProfile } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const session = sessions.find((s) => s.id === id);

  const [showChat, setShowChat] = useState(false);
  const [chatMode, setChatMode] = useState<"text" | "audio">("text");
  const [chatMessage, setChatMessage] = useState("");
  const [showAddInfo, setShowAddInfo] = useState(false);
  const [infoDetails, setInfoDetails] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [completionAmount, setCompletionAmount] = useState("");
  const [completionReview, setCompletionReview] = useState("");

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const calculateAmount = () => {
    if (!assistantProfile) return 0;

    if (assistantProfile.pricingModel === "fixed" && assistantProfile.rate) {
      return assistantProfile.rate;
    }

    if (assistantProfile.pricingModel === "hourly" && assistantProfile.rate) {
      const start = new Date(session.acceptedAt || session.createdAt);
      const end = new Date();
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      return hours * assistantProfile.rate;
    }

    return 0;
  };

  const handleCompleteSession = () => {
    const amount =
      assistantProfile?.pricingModel === "bespoke"
        ? parseFloat(completionAmount)
        : calculateAmount();

    updateSession(session.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      invoice: {
        amount,
        review: completionReview,
      },
    });

    setShowComplete(false);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Session Details",
          headerStyle: { backgroundColor: colors.background.primary },
          headerTintColor: colors.text.primary,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.userAvatar}>
              <User size={32} color={colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.requesterName}>{session.requesterName}</Text>
              {!session.isRequesterPatient && (
                <Text style={styles.patientInfo}>
                  Patient: {session.patientName}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <User size={18} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Age Range:</Text>
                <Text style={styles.infoValue}>{session.patientAgeRange}</Text>
              </View>
              <View style={styles.infoRow}>
                <User size={18} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Gender:</Text>
                <Text style={styles.infoValue}>{session.patientGender}</Text>
              </View>
              {session.specialService && (
                <View style={styles.infoRow}>
                  <FileText size={18} color={colors.text.secondary} />
                  <Text style={styles.infoLabel}>Service:</Text>
                  <Text style={styles.infoValue}>{session.specialService}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <MapPin size={18} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Hospital:</Text>
                <Text style={styles.infoValue}>{session.hospitalName}</Text>
              </View>
            </View>
          </View>

          {session.hasInsurance && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insurance</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Shield size={18} color={colors.accent} />
                  <Text style={styles.infoLabel}>Provider:</Text>
                  <Text style={styles.infoValue}>
                    {session.insuranceProvider || "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timing</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Clock size={18} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Requested:</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(session.createdAt)}
                </Text>
              </View>
              {session.acceptedAt && (
                <View style={styles.infoRow}>
                  <Clock size={18} color={colors.accent} />
                  <Text style={styles.infoLabel}>Accepted:</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(session.acceptedAt)}
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Calendar size={18} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>ETA:</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(session.estimatedArrival)}
                </Text>
              </View>
            </View>
          </View>

          {session.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.infoCard}>
                <Text style={styles.notesText}>{session.notes}</Text>
              </View>
            </View>
          )}

          <View style={styles.actionSection}>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.chatCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => setShowChat(true)}
            >
              <MessageCircle size={28} color={colors.accent} />
              <Text style={styles.actionTitle}>Chat</Text>
              <Text style={styles.actionDescription}>
                Communicate with patient
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.infoCard2,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => setShowAddInfo(true)}
            >
              <FileText size={28} color={colors.lavenderDark} />
              <Text style={styles.actionTitle}>Add Information</Text>
              <Text style={styles.actionDescription}>
                Upload media & details
              </Text>
            </Pressable>
          </View>

          <View style={styles.completeButtonContainer}>
            <Button
              title="Complete Session"
              onPress={() => setShowComplete(true)}
            />
          </View>
        </ScrollView>

        <Modal visible={showChat} animationType="slide" transparent={false}>
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat</Text>
              <Pressable onPress={() => setShowChat(false)}>
                <X size={24} color={colors.text.primary} />
              </Pressable>
            </View>

            <View style={styles.chatModeToggle}>
              <Pressable
                style={[
                  styles.modeButton,
                  chatMode === "text" && styles.modeButtonActive,
                ]}
                onPress={() => setChatMode("text")}
              >
                <MessageCircle
                  size={20}
                  color={
                    chatMode === "text" ? colors.text.inverse : colors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.modeText,
                    chatMode === "text" && styles.modeTextActive,
                  ]}
                >
                  Text
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modeButton,
                  chatMode === "audio" && styles.modeButtonActive,
                ]}
                onPress={() => setChatMode("audio")}
              >
                <Mic
                  size={20}
                  color={
                    chatMode === "audio" ? colors.text.inverse : colors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.modeText,
                    chatMode === "audio" && styles.modeTextActive,
                  ]}
                >
                  Audio
                </Text>
              </Pressable>
            </View>

            <ScrollView style={styles.chatContent}>
              <View style={styles.chatPlaceholder}>
                <MessageCircle size={48} color={colors.text.light} />
                <Text style={styles.chatPlaceholderText}>
                  No messages yet. Start a conversation!
                </Text>
              </View>
            </ScrollView>

            {chatMode === "text" ? (
              <View
                style={[
                  styles.chatInputContainer,
                  { paddingBottom: insets.bottom + 16 },
                ]}
              >
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.text.light}
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  multiline
                />
                <Pressable style={styles.sendButton}>
                  <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.audioControls,
                  { paddingBottom: insets.bottom + 16 },
                ]}
              >
                <Pressable style={styles.recordButton}>
                  <Mic size={32} color={colors.text.inverse} />
                  <Text style={styles.recordText}>Hold to Record</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Modal>

        <Modal visible={showAddInfo} animationType="slide" transparent={false}>
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Information</Text>
              <Pressable onPress={() => setShowAddInfo(false)}>
                <X size={24} color={colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[
                styles.modalContentInner,
                { paddingBottom: insets.bottom + 24 },
              ]}
            >
              <Pressable style={styles.uploadButton}>
                <ImageIcon size={24} color={colors.text.inverse} />
                <Text style={styles.uploadButtonText}>Upload Media</Text>
              </Pressable>

              <Text style={styles.inputLabel}>Details</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Add any relevant information..."
                placeholderTextColor={colors.text.light}
                value={infoDetails}
                onChangeText={setInfoDetails}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <Button
                title="Save Information"
                onPress={() => {
                  updateSession(session.id, {
                    notes: infoDetails,
                  });
                  setShowAddInfo(false);
                  setInfoDetails("");
                }}
              />
            </ScrollView>
          </View>
        </Modal>

        <Modal visible={showComplete} animationType="slide" transparent={false}>
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Session</Text>
              <Pressable onPress={() => setShowComplete(false)}>
                <X size={24} color={colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[
                styles.modalContentInner,
                { paddingBottom: insets.bottom + 24 },
              ]}
            >
              <View style={styles.amountSection}>
                <Text style={styles.inputLabel}>Amount</Text>
                {assistantProfile?.pricingModel === "bespoke" ? (
                  <Input
                    label=""
                    placeholder="Enter amount (GHS)"
                    value={completionAmount}
                    onChangeText={setCompletionAmount}
                    keyboardType="numeric"
                  />
                ) : (
                  <View style={styles.calculatedAmount}>
                    <Text style={styles.calculatedAmountLabel}>
                      {assistantProfile?.pricingModel === "fixed"
                        ? "Fixed Rate"
                        : "Calculated (Hourly)"}
                    </Text>
                    <Text style={styles.calculatedAmountValue}>
                      GHS {calculateAmount().toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>Review / Notes</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Add a review or final notes..."
                placeholderTextColor={colors.text.light}
                value={completionReview}
                onChangeText={setCompletionReview}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <Button
                title="Submit & Complete Session"
                onPress={handleCompleteSession}
              />
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
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
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.background.lavender,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  patientInfo: {
    fontSize: 16,
    color: colors.text.secondary,
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
  actionSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  chatCard: {
    backgroundColor: colors.background.mint,
  },
  infoCard2: {
    backgroundColor: colors.background.lavender,
  },
  actionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginTop: 8,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  completeButtonContainer: {
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  chatModeToggle: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  modeTextActive: {
    color: colors.text.inverse,
  },
  chatContent: {
    flex: 1,
  },
  chatPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  chatPlaceholderText: {
    fontSize: 15,
    color: colors.text.light,
    textAlign: "center",
    marginTop: 16,
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 2,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.inverse,
  },
  audioControls: {
    padding: 24,
    borderTopWidth: 2,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: colors.accent,
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recordText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.text.inverse,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: 24,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lavenderDark,
    padding: 20,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.inverse,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    minHeight: 140,
    marginBottom: 24,
  },
  amountSection: {
    marginBottom: 24,
  },
  calculatedAmount: {
    backgroundColor: colors.background.mint,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  calculatedAmountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  calculatedAmountValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.accent,
  },
});
