import { Stack, useRouter } from "expo-router";
import colors from "@/constants/colors";
import { ArrowLeft } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { OnboardingContextProvider } from "@/contexts/OnboardingContext";

export default function OnboardingLayout() {
  const router = useRouter();

  const handleBackPress = (screenName: string) => {
    if (screenName === 'general') {
      router.push('/user-type');
    } else {
      router.back();
    }
  };

  return (
    <OnboardingContextProvider>
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
        <Stack.Screen 
          name="general" 
          options={{ 
            title: "General Information",
            headerLeft: () => (
              <TouchableOpacity onPress={() => handleBackPress('general')} style={{ padding: 8 }}>
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="kyc" 
          options={{ 
            title: "KYC Verification",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="services" 
          options={{ 
            title: "Services Offered",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="pricing" 
          options={{ 
            title: "Pricing",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="review" 
          options={{ 
            title: "Review & Submit",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }} 
        />
      </Stack>
    </OnboardingContextProvider>
  );
}
