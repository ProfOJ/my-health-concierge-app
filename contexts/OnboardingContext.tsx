import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface OnboardingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  photo: string;
  role: string;
  idPhoto: string;
  otherDetails: string;
  services: string[];
  pricingModel: "fixed" | "hourly" | "bespoke";
  rate?: number;
  rateRange?: { min: number; max: number };
}

const STORAGE_KEY = "@health_concierge:onboarding_data";

export const [OnboardingContextProvider, useOnboarding] = createContextHook(() => {
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setOnboardingData(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load onboarding data:", error);
      }
    };
    loadStoredData();
  }, []);

  const updateOnboardingData = useCallback(async (updates: Partial<OnboardingData>) => {
    try {
      const updated = { ...onboardingData, ...updates };
      setOnboardingData(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log("Onboarding data updated:", Object.keys(updates));
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  }, [onboardingData]);

  const clearOnboardingData = useCallback(async () => {
    try {
      setOnboardingData({});
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("Onboarding data cleared");
    } catch (error) {
      console.error("Failed to clear onboarding data:", error);
    }
  }, []);

  return useMemo(
    () => ({
      onboardingData,
      updateOnboardingData,
      clearOnboardingData,
    }),
    [onboardingData, updateOnboardingData, clearOnboardingData]
  );
});
