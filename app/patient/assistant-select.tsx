import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { HEALTH_ASSISTANTS } from "@/constants/assistants";
import { useRouter } from "expo-router";
import { usePatientRequest } from "@/contexts/PatientRequestContext";
import { Star, MapPin } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AssistantSelectScreen() {
  const router = useRouter();
  const { setAssistant } = usePatientRequest();
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [autoMatch, setAutoMatch] = useState(false);

  const handleRequest = () => {
    setAssistant(autoMatch ? null : selectedAssistant);
    router.push("/patient/personal-info");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.autoMatchSection}>
          <Pressable
            style={[styles.autoMatchCard, autoMatch && styles.autoMatchCardSelected]}
            onPress={() => {
              setAutoMatch(!autoMatch);
              setSelectedAssistant(null);
            }}
          >
            <View style={styles.checkbox}>
              {autoMatch && <View style={styles.checkboxInner} />}
            </View>
            <View style={styles.autoMatchText}>
              <Text style={styles.autoMatchTitle}>Find assistant for me</Text>
              <Text style={styles.autoMatchDescription}>
                We&apos;ll match you with the best available assistant
              </Text>
            </View>
          </Pressable>
        </View>

        {!autoMatch && (
          <>
            <Text style={styles.sectionTitle}>Available Assistants</Text>
            <View style={styles.assistantsList}>
              {HEALTH_ASSISTANTS.map((assistant) => {
                const isSelected = selectedAssistant === assistant.id;
                return (
                  <Pressable
                    key={assistant.id}
                    style={[
                      styles.assistantCard,
                      isSelected && styles.assistantCardSelected,
                    ]}
                    onPress={() => setSelectedAssistant(assistant.id)}
                  >
                    <View style={styles.assistantCardContent}>
                      <Image
                        source={{ uri: assistant.photo }}
                        style={styles.assistantPhoto}
                      />
                      <View style={styles.assistantInfo}>
                        <Text style={styles.assistantName}>{assistant.name}</Text>
                        <View style={styles.ratingRow}>
                          <Star size={14} color={colors.warning} fill={colors.warning} />
                          <Text style={styles.ratingText}>
                            {assistant.rating} ({assistant.totalReviews})
                          </Text>
                        </View>
                        <View style={styles.specialtiesRow}>
                          {assistant.specialties.slice(0, 2).map((specialty, idx) => (
                            <View key={idx} style={styles.specialtyBadge}>
                              <Text style={styles.specialtyText}>{specialty}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={styles.priceRow}>
                          <MapPin size={12} color={colors.text.secondary} />
                          <Text style={styles.priceText}>
                            {assistant.pricingModel === "fixed"
                              ? `GHS ${assistant.rate} per session`
                              : assistant.pricingModel === "hourly"
                              ? `GHS ${assistant.rate}/hr`
                              : `GHS ${assistant.rateRange?.min}-${assistant.rateRange?.max}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Pressable
                      style={[
                        styles.requestButton,
                        isSelected && styles.requestButtonSelected,
                      ]}
                      onPress={handleRequest}
                    >
                      <Text
                        style={[
                          styles.requestButtonText,
                          isSelected && styles.requestButtonTextSelected,
                        ]}
                      >
                        Request
                      </Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {autoMatch && (
        <View style={styles.footer}>
          <Button title="Continue" onPress={handleRequest} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.mint,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  autoMatchSection: {
    marginBottom: 32,
  },
  autoMatchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  autoMatchCardSelected: {
    backgroundColor: colors.card.mint,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  autoMatchText: {
    flex: 1,
  },
  autoMatchTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  autoMatchDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  assistantsList: {
    gap: 16,
  },
  assistantCard: {
    flexDirection: "column",
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    borderWidth: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  assistantCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  assistantCardSelected: {
    backgroundColor: colors.card.mint,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  assistantPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  assistantInfo: {
    flex: 1,
  },
  assistantName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  specialtiesRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  specialtyBadge: {
    backgroundColor: colors.card.lavender,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  requestButton: {
    width: "100%",
    paddingVertical: 18,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  requestButtonSelected: {
    backgroundColor: colors.primary,
    borderTopWidth: 0,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  requestButtonTextSelected: {
    color: colors.background.primary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 16,
    backgroundColor: colors.background.mint,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
});
