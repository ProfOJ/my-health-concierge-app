import { Stack } from "expo-router";
import colors from "@/constants/colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: "700" as const,
          fontSize: 20,
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="general" options={{ title: "General Information" }} />
      <Stack.Screen name="kyc" options={{ title: "KYC Verification" }} />
      <Stack.Screen name="services" options={{ title: "Services Offered" }} />
      <Stack.Screen name="pricing" options={{ title: "Pricing" }} />
      <Stack.Screen name="review" options={{ title: "Review & Submit" }} />
    </Stack>
  );
}
