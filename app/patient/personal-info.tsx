import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { usePatientRequest } from "@/contexts/PatientRequestContext";
import { supabase } from "@/lib/supabase";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { hospital, assistantId, clearRequest } = usePatientRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    location: "",
    isPatient: true,
    hasInsurance: false,
    insuranceProvider: "",
    insuranceNumber: "",
    hasCard: false,
    cardDetails: "",
  });

  const handleSubmit = async () => {
    if (!hospital) {
      Alert.alert("Error", "Hospital information is missing. Please go back and select a hospital.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .insert({
          name: formData.name,
          contact: formData.contact,
          location: formData.location,
          is_patient: formData.isPatient,
          has_insurance: formData.hasInsurance,
          insurance_provider: formData.hasInsurance ? formData.insuranceProvider : null,
          insurance_number: formData.hasInsurance ? formData.insuranceNumber : null,
          has_card: formData.hasCard,
          card_details: formData.hasCard ? formData.cardDetails : null,
        })
        .select()
        .single();

      if (patientError) {
        console.error("Failed to create patient:", patientError);
        throw patientError;
      }

      console.log("Patient created successfully:", patientData.id);

      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + 30);

      const { data: sessionData, error: sessionError } = await supabase
        .from("hospital_sessions")
        .insert({
          patient_id: patientData.id,
          patient_name: formData.name,
          patient_gender: "Not specified",
          patient_age_range: "Not specified",
          hospital_id: hospital.id,
          hospital_name: hospital.name,
          assistant_id: assistantId || null,
          requester_name: formData.name,
          is_requester_patient: formData.isPatient,
          estimated_arrival: estimatedArrival.toISOString(),
          location: formData.location,
          has_insurance: formData.hasInsurance,
          insurance_provider: formData.hasInsurance ? formData.insuranceProvider : null,
          has_card: formData.hasCard,
          status: "pending",
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Failed to create hospital session:", sessionError);
        throw sessionError;
      }

      console.log("Hospital session created successfully:", sessionData.id);

      clearRequest();
      router.replace("/patient/request-success");
    } catch (error) {
      console.error("Error submitting hospital assistance request:", error);
      Alert.alert(
        "Submission Failed",
        "Failed to submit your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.name && formData.contact && formData.location;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>While you&apos;re waiting, provide us with this info</Text>

        <Input
          label="Your Name"
          value={formData.name}
          onChangeText={(name) => setFormData({ ...formData, name })}
          placeholder="Enter your full name"
        />

        <Input
          label="Contact Number"
          value={formData.contact}
          onChangeText={(contact) => setFormData({ ...formData, contact })}
          placeholder="+233 XX XXX XXXX"
          keyboardType="phone-pad"
        />

        <Input
          label="Where are you coming from?"
          value={formData.location}
          onChangeText={(location) => setFormData({ ...formData, location })}
          placeholder="Your current location"
        />

        <View style={styles.questionSection}>
          <Text style={styles.questionLabel}>Are you the patient?</Text>
          <View style={styles.optionsRow}>
            <Pressable
              style={[
                styles.optionButton,
                formData.isPatient && styles.optionButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, isPatient: true })}
            >
              {formData.isPatient && (
                <Check size={16} color={colors.primary} style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.optionText,
                  formData.isPatient && styles.optionTextSelected,
                ]}
              >
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                !formData.isPatient && styles.optionButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, isPatient: false })}
            >
              {!formData.isPatient && (
                <Check size={16} color={colors.primary} style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.optionText,
                  !formData.isPatient && styles.optionTextSelected,
                ]}
              >
                No
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.questionSection}>
          <Text style={styles.questionLabel}>Do you have health insurance?</Text>
          <View style={styles.optionsRow}>
            <Pressable
              style={[
                styles.optionButton,
                formData.hasInsurance && styles.optionButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, hasInsurance: true })}
            >
              {formData.hasInsurance && (
                <Check size={16} color={colors.primary} style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.optionText,
                  formData.hasInsurance && styles.optionTextSelected,
                ]}
              >
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                !formData.hasInsurance && styles.optionButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, hasInsurance: false })}
            >
              {!formData.hasInsurance && (
                <Check size={16} color={colors.primary} style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.optionText,
                  !formData.hasInsurance && styles.optionTextSelected,
                ]}
              >
                No
              </Text>
            </Pressable>
          </View>
        </View>

        {formData.hasInsurance && (
          <>
            <Input
              label="Insurance Provider"
              value={formData.insuranceProvider}
              onChangeText={(insuranceProvider) =>
                setFormData({ ...formData, insuranceProvider })
              }
              placeholder="Provider name"
            />
            <Input
              label="Insurance Number"
              value={formData.insuranceNumber}
              onChangeText={(insuranceNumber) =>
                setFormData({ ...formData, insuranceNumber })
              }
              placeholder="Policy number"
            />
          </>
        )}

        <View style={styles.questionSection}>
          <Text style={styles.questionLabel}>Do you have a card at this hospital?</Text>
          <View style={styles.optionsRow}>
            <Pressable
              style={[
                styles.optionButton,
                formData.hasCard && styles.optionButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, hasCard: true })}
            >
              {formData.hasCard && (
                <Check size={16} color={colors.primary} style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.optionText,
                  formData.hasCard && styles.optionTextSelected,
                ]}
              >
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                !formData.hasCard && styles.optionButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, hasCard: false })}
            >
              {!formData.hasCard && (
                <Check size={16} color={colors.primary} style={styles.checkIcon} />
              )}
              <Text
                style={[
                  styles.optionText,
                  !formData.hasCard && styles.optionTextSelected,
                ]}
              >
                No
              </Text>
            </Pressable>
          </View>
        </View>

        {formData.hasCard && (
          <Input
            label="Card Details (Optional)"
            value={formData.cardDetails}
            onChangeText={(cardDetails) =>
              setFormData({ ...formData, cardDetails })
            }
            placeholder="Card number or other details"
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={isSubmitting ? "Submitting..." : "Submit Request"} 
          onPress={handleSubmit} 
          disabled={!isValid || isSubmitting} 
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
    paddingBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 24,
    lineHeight: 28,
    textAlign: "center",
  },
  questionSection: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 6,
    minHeight: 54,
  },
  optionButtonSelected: {
    backgroundColor: colors.primaryLight + "20",
    borderColor: colors.primary,
    borderWidth: 3,
  },
  checkIcon: {
    marginRight: 2,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: 2,
    borderTopColor: colors.border.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});
