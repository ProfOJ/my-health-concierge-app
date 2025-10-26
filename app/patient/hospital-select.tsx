import colors from "@/constants/colors";
import { HOSPITALS, Hospital } from "@/constants/hospitals";
import { useRouter } from "expo-router";
import { MapPin, Search, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HospitalSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHospitals = HOSPITALS.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectHospital = (hospital: Hospital) => {
    router.push("/patient/assistant-select");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Which hospital are you headed to?</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.text.light} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hospitals..."
            placeholderTextColor={colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHospitals.map((hospital) => (
          <Pressable
            key={hospital.id}
            style={({ pressed }) => [
              styles.hospitalCard,
              pressed && styles.hospitalCardPressed,
            ]}
            onPress={() => handleSelectHospital(hospital)}
          >
            <View style={styles.hospitalIcon}>
              <MapPin size={24} color={colors.primary} />
            </View>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{hospital.name}</Text>
              <Text style={styles.hospitalLocation}>{hospital.location}</Text>
              <Text style={styles.assistantsAvailable}>
                {hospital.availableAssistants} assistant{hospital.availableAssistants !== 1 ? "s" : ""} available now
              </Text>
            </View>
            <ChevronRight size={24} color={colors.text.light} />
          </Pressable>
        ))}
      </ScrollView>
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
    paddingVertical: 24,
    backgroundColor: colors.background.cream,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 0,
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: 24,
    gap: 12,
  },
  hospitalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  hospitalCardPressed: {
    backgroundColor: colors.background.secondary,
    transform: [{ scale: 0.98 }],
  },
  hospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  hospitalLocation: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  assistantsAvailable: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.success,
  },
});
