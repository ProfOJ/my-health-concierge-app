import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type PricingModel = "fixed" | "hourly" | "bespoke";

export default function PricingScreen() {
  const router = useRouter();
  const [pricingModel, setPricingModel] = useState<PricingModel | null>(null);
  const [fixedRate, setFixedRate] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");

  const handleContinue = () => {
    router.push("/assistant/onboarding/review");
  };

  const isValid =
    (pricingModel === "fixed" && fixedRate) ||
    (pricingModel === "hourly" && hourlyRate) ||
    (pricingModel === "bespoke" && minRate && maxRate);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Set your pricing model and rates for services
        </Text>

        <View style={styles.modelSection}>
          <Text style={styles.sectionTitle}>Pricing Model</Text>
          
          <Pressable
            style={[
              styles.modelCard,
              pricingModel === "fixed" && styles.modelCardSelected,
            ]}
            onPress={() => setPricingModel("fixed")}
          >
            <View style={styles.modelHeader}>
              <View>
                <Text style={styles.modelTitle}>Fixed Rate</Text>
                <Text style={styles.modelDescription}>
                  Charge a flat rate per session
                </Text>
              </View>
              {pricingModel === "fixed" && (
                <Check size={24} color={colors.primary} />
              )}
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.modelCard,
              pricingModel === "hourly" && styles.modelCardSelected,
            ]}
            onPress={() => setPricingModel("hourly")}
          >
            <View style={styles.modelHeader}>
              <View>
                <Text style={styles.modelTitle}>Per Hour</Text>
                <Text style={styles.modelDescription}>
                  Charge based on hours worked
                </Text>
              </View>
              {pricingModel === "hourly" && (
                <Check size={24} color={colors.primary} />
              )}
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.modelCard,
              pricingModel === "bespoke" && styles.modelCardSelected,
            ]}
            onPress={() => setPricingModel("bespoke")}
          >
            <View style={styles.modelHeader}>
              <View>
                <Text style={styles.modelTitle}>Bespoke</Text>
                <Text style={styles.modelDescription}>
                  Negotiate rate with each client
                </Text>
              </View>
              {pricingModel === "bespoke" && (
                <Check size={24} color={colors.primary} />
              )}
            </View>
          </Pressable>
        </View>

        {pricingModel === "fixed" && (
          <View style={styles.rateSection}>
            <Input
              label="Fixed Rate (GHS)"
              value={fixedRate}
              onChangeText={setFixedRate}
              placeholder="200"
              keyboardType="numeric"
            />
          </View>
        )}

        {pricingModel === "hourly" && (
          <View style={styles.rateSection}>
            <Input
              label="Hourly Rate (GHS)"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="50"
              keyboardType="numeric"
            />
          </View>
        )}

        {pricingModel === "bespoke" && (
          <View style={styles.rateSection}>
            <Text style={styles.sectionTitle}>Rate Range (GHS)</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.rangeInput}>
                <Input
                  label="Minimum"
                  value={minRate}
                  onChangeText={setMinRate}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rangeSeparator}>
                <Text style={styles.rangeSeparatorText}>to</Text>
              </View>
              <View style={styles.rangeInput}>
                <Input
                  label="Maximum"
                  value={maxRate}
                  onChangeText={setMaxRate}
                  placeholder="300"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}
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
    backgroundColor: colors.background.primary,
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
  modelSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  modelCard: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modelCardSelected: {
    backgroundColor: colors.primaryLight + "10",
    borderColor: colors.primary,
  },
  modelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  rateSection: {
    marginTop: 8,
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    paddingTop: 28,
  },
  rangeSeparatorText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
