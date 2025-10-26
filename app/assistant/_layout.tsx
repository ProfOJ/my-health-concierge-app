import { Stack } from "expo-router";
import colors from "@/constants/colors";

export default function AssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: "700" as const,
        },
      }}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="sessions" options={{ title: "My Sessions" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="go-live" options={{ headerShown: false }} />
    </Stack>
  );
}
