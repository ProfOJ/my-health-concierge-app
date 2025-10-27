import { Stack } from "expo-router";
import colors from "@/constants/colors";
import { PatientRequestProvider } from "@/contexts/PatientRequestContext";

export default function PatientLayout() {
  return (
    <PatientRequestProvider>
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
        <Stack.Screen name="service-type" options={{ headerShown: false }} />
        <Stack.Screen name="home-care" options={{ headerShown: false }} />
        <Stack.Screen name="health-supplies" options={{ headerShown: false }} />
        <Stack.Screen name="hospital-select" options={{ headerShown: false }} />
        <Stack.Screen name="assistant-select" options={{ title: "Select Assistant" }} />
        <Stack.Screen name="personal-info" options={{ title: "Your Information" }} />
        <Stack.Screen name="session" options={{ title: "Session Details" }} />
        <Stack.Screen name="request-success" options={{ headerShown: false }} />
      </Stack>
    </PatientRequestProvider>
  );
}
