import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppContextProvider } from "@/contexts/AppContext";
import colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import { Platform, Dimensions, View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: "700" as const,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="user-type" options={{ headerShown: false }} />
      <Stack.Screen name="assistant" options={{ headerShown: false }} />
      <Stack.Screen name="patient" options={{ headerShown: false }} />
    </Stack>
  );
}

function MobilePrompt({ onContinue }: { onContinue: () => void }) {
  const appUrl = typeof window !== "undefined" ? window.location.href : "https://rork.app";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}`;

  return (
    <View style={promptStyles.container}>
      <View style={promptStyles.content}>
        <Text style={promptStyles.title}>Use this app on a mobile phone for the best experience</Text>
        
        <View style={promptStyles.qrContainer}>
          <Text style={promptStyles.qrTitle}>Scan to continue on mobile</Text>
          <Image 
            source={{ uri: qrCodeUrl }} 
            style={promptStyles.qrCode}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity style={promptStyles.button} onPress={onContinue}>
          <Text style={promptStyles.buttonText}>Continue on web</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const promptStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    maxWidth: 500,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 32,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666666",
    marginBottom: 16,
  },
  qrCode: {
    width: 250,
    height: 250,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  button: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});

function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <View style={mobileStyles.wrapper}>
      <View style={mobileStyles.mobileFrame}>
        {children}
      </View>
    </View>
  );
}

const mobileStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  mobileFrame: {
    width: 390,
    height: 844,
    backgroundColor: "#ffffff",
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default function RootLayout() {
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [continueOnWeb, setContinueOnWeb] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();

    if (Platform.OS === "web") {
      const { width } = Dimensions.get("window");
      if (width > 768) {
        setShowMobilePrompt(true);
      }
    }
  }, []);

  const handleContinueOnWeb = () => {
    setContinueOnWeb(true);
    setShowMobilePrompt(false);
  };

  const content = (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AppContextProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );

  if (showMobilePrompt) {
    return <MobilePrompt onContinue={handleContinueOnWeb} />;
  }

  if (continueOnWeb && Platform.OS === "web") {
    return <MobileContainer>{content}</MobileContainer>;
  }

  return content;
}
