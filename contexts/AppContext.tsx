import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  assistantApi,
  patientApi,
  sessionApi,
  liveSessionApi,
} from "@/lib/api";

export type UserType = "assistant" | "patient" | null;

export interface AssistantProfile {
  id: string;
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
  verificationStatus: "verified" | "pending" | "rejected";
}

export interface PatientProfile {
  id: string;
  name: string;
  contact: string;
  location: string;
  isPatient: boolean;
  hasInsurance: boolean;
  insuranceProvider?: string;
  insuranceNumber?: string;
  hasCard: boolean;
  cardPhoto?: string;
  cardDetails?: string;
  idPhoto?: string;
}

export interface SessionRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientGender: string;
  patientAgeRange: string;
  specialService?: string;
  hospitalId: string;
  hospitalName: string;
  assistantId?: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "declined";
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  requesterName: string;
  isRequesterPatient: boolean;
  estimatedArrival: string;
  location?: string;
  hasInsurance?: boolean;
  insuranceProvider?: string;
  hasCard?: boolean;
  notes?: string;
  media?: { id: string; uri: string; type: string }[];
  invoice?: {
    amount: number;
    review?: string;
    paidAt?: string;
  };
}

export interface LiveSession {
  hospitalId: string;
  hospitalName: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  startedAt: string;
}

const STORAGE_KEYS = {
  USER_TYPE: "@health_concierge:user_type",
  ASSISTANT_ID: "@health_concierge:assistant_id",
  PATIENT_ID: "@health_concierge:patient_id",
};

export const [AppContextProvider, useApp] = createContextHook(() => {
  const [userType, setUserType] = useState<UserType>(null);
  const [assistantProfile, setAssistantProfile] = useState<AssistantProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPersistedData = useCallback(async () => {
    try {
      const [storedUserType, storedAssistantId, storedPatientId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.ASSISTANT_ID),
        AsyncStorage.getItem(STORAGE_KEYS.PATIENT_ID),
      ]);

      if (storedUserType) setUserType(storedUserType as UserType);

      if (storedAssistantId) {
        const profile = await assistantApi.getById(storedAssistantId);
        if (profile) {
          setAssistantProfile(profile);
          const activeLive = await liveSessionApi.getActive(storedAssistantId);
          if (activeLive) setLiveSession(activeLive);
          const assistantSessions = await sessionApi.getByAssistant(storedAssistantId);
          setSessions(assistantSessions);
        }
      }

      if (storedPatientId) {
        const profile = await patientApi.getById(storedPatientId);
        if (profile) setPatientProfile(profile);
      }
    } catch (error) {
      console.error("Failed to load persisted data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersistedData();
  }, [loadPersistedData]);

  const selectUserType = useCallback(async (type: UserType) => {
    setUserType(type);
    if (type) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
    }
  }, []);

  const saveAssistantProfile = useCallback(
    async (profile: AssistantProfile) => {
      try {
        let savedProfile: AssistantProfile;
        if (profile.id) {
          savedProfile = await assistantApi.update(profile.id, profile);
        } else {
          const { id, ...profileWithoutId } = profile;
          savedProfile = await assistantApi.create(profileWithoutId);
          await AsyncStorage.setItem(STORAGE_KEYS.ASSISTANT_ID, savedProfile.id);
        }
        setAssistantProfile(savedProfile);
        console.log("Assistant profile saved successfully:", savedProfile.id);
      } catch (error) {
        console.error("Failed to save assistant profile:", error);
        throw error;
      }
    },
    []
  );

  const savePatientProfile = useCallback(
    async (profile: PatientProfile) => {
      try {
        let savedProfile: PatientProfile;
        if (profile.id) {
          savedProfile = await patientApi.update(profile.id, profile);
        } else {
          const { id, ...profileWithoutId } = profile;
          savedProfile = await patientApi.create(profileWithoutId);
          await AsyncStorage.setItem(STORAGE_KEYS.PATIENT_ID, savedProfile.id);
        }
        setPatientProfile(savedProfile);
        console.log("Patient profile saved successfully:", savedProfile.id);
      } catch (error) {
        console.error("Failed to save patient profile:", error);
        throw error;
      }
    },
    []
  );

  const addSession = useCallback(
    async (session: SessionRequest) => {
      try {
        const { id, createdAt, ...sessionWithoutId } = session;
        const savedSession = await sessionApi.create(sessionWithoutId);
        setSessions((prev) => [savedSession, ...prev]);
        console.log("Session added successfully:", savedSession.id);
        return savedSession;
      } catch (error) {
        console.error("Failed to add session:", error);
        throw error;
      }
    },
    []
  );

  const updateSession = useCallback(
    async (sessionId: string, updates: Partial<SessionRequest>) => {
      try {
        const updatedSession = await sessionApi.update(sessionId, updates);
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s))
        );
        console.log("Session updated successfully:", sessionId);
      } catch (error) {
        console.error("Failed to update session:", error);
        throw error;
      }
    },
    []
  );

  const refreshSessions = useCallback(async () => {
    if (!assistantProfile?.id) return;
    try {
      const assistantSessions = await sessionApi.getByAssistant(assistantProfile.id);
      setSessions(assistantSessions);
    } catch (error) {
      console.error("Failed to refresh sessions:", error);
    }
  }, [assistantProfile?.id]);

  const goLive = useCallback(
    async (session: LiveSession) => {
      if (!assistantProfile?.id) {
        console.error("No assistant profile found");
        return;
      }
      try {
        const liveSessionData = await liveSessionApi.create(assistantProfile.id, session);
        setLiveSession(liveSessionData);
        console.log("Gone live successfully");
      } catch (error) {
        console.error("Failed to go live:", error);
        throw error;
      }
    },
    [assistantProfile?.id]
  );

  const goOffline = useCallback(
    async (notes?: string) => {
      if (!assistantProfile?.id) return;
      try {
        await liveSessionApi.end(assistantProfile.id, notes);
        setLiveSession(null);
        console.log("Gone offline successfully");
      } catch (error) {
        console.error("Failed to go offline:", error);
        throw error;
      }
    },
    [assistantProfile?.id]
  );

  const resetApp = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TYPE,
      STORAGE_KEYS.ASSISTANT_ID,
      STORAGE_KEYS.PATIENT_ID,
    ]);
    setUserType(null);
    setAssistantProfile(null);
    setPatientProfile(null);
    setSessions([]);
    setLiveSession(null);
  }, []);

  return useMemo(
    () => ({
      userType,
      assistantProfile,
      patientProfile,
      sessions,
      liveSession,
      isLoading,
      selectUserType,
      saveAssistantProfile,
      savePatientProfile,
      addSession,
      updateSession,
      refreshSessions,
      goLive,
      goOffline,
      resetApp,
    }),
    [
      userType,
      assistantProfile,
      patientProfile,
      sessions,
      liveSession,
      isLoading,
      selectUserType,
      saveAssistantProfile,
      savePatientProfile,
      addSession,
      updateSession,
      refreshSessions,
      goLive,
      goOffline,
      resetApp,
    ]
  );
});
