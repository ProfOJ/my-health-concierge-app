import { useApp } from "@/contexts/AppContext";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
  const { userType, assistantProfile } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideUpAnim]);

  const handleStart = () => {
    if (!userType) {
      router.replace("/user-type");
    } else if (userType === "assistant") {
      if (assistantProfile?.verified) {
        router.replace("/assistant/dashboard");
      } else {
        router.replace("/assistant/onboarding/general");
      }
    } else if (userType === "patient") {
      router.replace("/patient/hospital-select");
    }
  };

  return (
    <LinearGradient
      colors={["#B794F6", "#9B7EDE", "#8B6FD4"]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop" }}
              style={styles.illustration}
              resizeMode="contain"
            />
            <View style={styles.decorTop1} />
            <View style={styles.decorTop2} />
            <View style={styles.decorBottom} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Skip the{"\n"}stress{"\n"}Get a health {"\n"}Concierge.</Text>
            <Text style={styles.subtitle}>
              Find a personal hospital assistant to simplify {"\n"} your experience at any hospital.
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Let&apos;s start!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    position: "relative",
  },
  illustration: {
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  decorTop1: {
    position: "absolute",
    top: 40,
    left: 40,
    width: 20,
    height: 20,
    opacity: 0.6,
  },
  decorTop2: {
    position: "absolute",
    top: 60,
    right: 60,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  decorBottom: {
    position: "absolute",
    bottom: 40,
    right: 40,
    width: 30,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  textContainer: {
    alignItems: "flex-start",
    marginTop: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: "#ffffff",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
