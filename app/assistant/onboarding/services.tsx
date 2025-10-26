import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { HEALTHCARE_SERVICES } from "@/constants/assistants";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ServicesScreen() {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleContinue = () => {
    router.push("/assistant/onboarding/pricing");
  };

  const isValid = selectedServices.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Select the services you can provide to patients
        </Text>

        <View style={styles.servicesGrid}>
          {HEALTHCARE_SERVICES.map((service) => {
            const isSelected = selectedServices.includes(service);
            return (
              <Pressable
                key={service}
                style={[styles.serviceChip, isSelected && styles.serviceChipSelected]}
                onPress={() => toggleService(service)}
              >
                {isSelected && (
                  <Check
                    size={18}
                    color={colors.primary}
                    style={styles.checkIcon}
                  />
                )}
                <Text
                  style={[
                    styles.serviceText,
                    isSelected && styles.serviceTextSelected,
                  ]}
                >
                  {service}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} disabled={!isValid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  scrollContent: {
    padding: 24,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderWidth: 0,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceChipSelected: {
    backgroundColor: colors.card.mint,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  checkIcon: {
    marginRight: 2,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.text.secondary,
  },
  serviceTextSelected: {
    color: colors.primary,
    fontWeight: "600" as const,
  },
  selectedCount: {
    marginTop: 24,
    padding: 18,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCountText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: colors.background.cream,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
});
