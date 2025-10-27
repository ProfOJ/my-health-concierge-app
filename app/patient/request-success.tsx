import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle } from "lucide-react-native";

export default function RequestSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCheckStatus = () => {
    router.push("/patient/session");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color={colors.success} strokeWidth={2} />
        </View>

        <Image
          source={{
            uri: "https://media.istockphoto.com/id/1472752705/vector/happy-businessman-with-legal-certified-approved-document-paperwork-of-successful-project-or.jpg?s=612x612&w=0&k=20&c=z7VeKq1_yM4pzKg6sJr9x4BliTYJGm7HI0VZKTpOqHs=",
          }}
          style={styles.heroImage}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            We have received your request and are promptly attending to it
          </Text>
          <Text style={styles.subtitle}>
            You may receive a call from us to coordinate.{"\n"}
            Call or Whatsapp us anytime on{" "}
            <Text style={styles.phone}>0503516739</Text>
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Button title="Check Status" onPress={handleCheckStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  heroImage: {
    width: 280,
    height: 280,
    marginBottom: 32,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  phone: {
    fontWeight: "700" as const,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
