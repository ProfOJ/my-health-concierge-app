import colors from "@/constants/colors";
import type { Hospital } from "@/constants/hospitals";
import { hospitalApi } from "@/lib/api";
import { useRouter } from "expo-router";
import { usePatientRequest } from "@/contexts/PatientRequestContext";
import { MapPin, Search, ChevronRight, ArrowLeft } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function HospitalCardSkeleton() {
  const animatedValue = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.hospitalCard}>
      <Animated.View style={[styles.skeletonIcon, { opacity }]} />
      <View style={styles.hospitalInfo}>
        <Animated.View style={[styles.skeletonLine, styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonLine, styles.skeletonSubtitle, { opacity }]} />
        <Animated.View style={[styles.skeletonLine, styles.skeletonTag, { opacity }]} />
      </View>
      <Animated.View style={[styles.skeletonChevron, { opacity }]} />
    </View>
  );
}

export default function HospitalSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHospital } = usePatientRequest();
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        console.log("Loading hospitals from database...");
        const data = await hospitalApi.getAll();
        console.log("Loaded", data.length, "hospitals");
        console.log("First hospital:", JSON.stringify(data[0], null, 2));
        setHospitals(data);
      } catch (error) {
        console.error("Failed to load hospitals:", error);
      } finally {
        setIsLoadingHospitals(false);
      }
    };
    loadHospitals();
  }, []);

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectHospital = (hospital: Hospital) => {
    console.log("Selected hospital:", JSON.stringify(hospital, null, 2));
    console.log("Hospital ID:", hospital.id, "Type:", typeof hospital.id);
    setHospital(hospital);
    router.push("/patient/assistant-select");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/user-type")}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
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
        {isLoadingHospitals ? (
          Array.from({ length: 5 }).map((_, index) => (
            <HospitalCardSkeleton key={index} />
          ))
        ) : (
          filteredHospitals.map((hospital) => (
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
                {hospital.availableAssistants !== undefined && (
                  <Text style={styles.assistantsAvailable}>
                    {hospital.availableAssistants} assistant{hospital.availableAssistants !== 1 ? "s" : ""} available now
                  </Text>
                )}
              </View>
              <ChevronRight size={24} color={colors.text.light} />
            </Pressable>
          ))
        )}
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
    paddingVertical: 16,
    backgroundColor: colors.background.cream,
    borderBottomWidth: 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.text.light,
  },
  skeletonLine: {
    backgroundColor: colors.text.light,
    borderRadius: 4,
  },
  skeletonTitle: {
    height: 16,
    width: "70%" as const,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 14,
    width: "50%" as const,
    marginBottom: 8,
  },
  skeletonTag: {
    height: 13,
    width: "40%" as const,
  },
  skeletonChevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text.light,
  },
});
