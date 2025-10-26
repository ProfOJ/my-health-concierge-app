import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  ASSISTANT_PROFILE: "@health_concierge:assistant_profile",
  PATIENT_PROFILE: "@health_concierge:patient_profile",
  SESSIONS: "@health_concierge:sessions",
  LIVE_SESSION: "@health_concierge:live_session",
};

export const [AppContextProvider, useApp] = createContextHook(() => {
  const [userType, setUserType] = useState<UserType>(null);
  const [assistantProfile, setAssistantProfile] = useState<AssistantProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [storedUserType, storedAssistant, storedPatient, storedSessions, storedLiveSession] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.ASSISTANT_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LIVE_SESSION),
      ]);

      if (storedUserType) setUserType(storedUserType as UserType);
      if (storedAssistant) setAssistantProfile(JSON.parse(storedAssistant));
      if (storedPatient) setPatientProfile(JSON.parse(storedPatient));
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      if (storedLiveSession) setLiveSession(JSON.parse(storedLiveSession));
    } catch (error) {
      console.error("Failed to load persisted data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectUserType = useCallback(async (type: UserType) => {
    setUserType(type);
    if (type) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
    }
  }, []);

  const saveAssistantProfile = useCallback(async (profile: AssistantProfile) => {
    setAssistantProfile(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.ASSISTANT_PROFILE, JSON.stringify(profile));
  }, []);

  const savePatientProfile = useCallback(async (profile: PatientProfile) => {
    setPatientProfile(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(profile));
  }, []);

  const addSession = useCallback(async (session: SessionRequest) => {
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
  }, [sessions]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<SessionRequest>) => {
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, ...updates } : s
    );
    setSessions(updatedSessions);
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
  }, [sessions]);

  const goLive = useCallback(async (session: LiveSession) => {
    setLiveSession(session);
    await AsyncStorage.setItem(STORAGE_KEYS.LIVE_SESSION, JSON.stringify(session));
  }, []);

  const goOffline = useCallback(async () => {
    setLiveSession(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.LIVE_SESSION);
  }, []);

  const resetApp = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TYPE,
      STORAGE_KEYS.ASSISTANT_PROFILE,
      STORAGE_KEYS.PATIENT_PROFILE,
      STORAGE_KEYS.SESSIONS,
      STORAGE_KEYS.LIVE_SESSION,
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
      goLive,
      goOffline,
      resetApp,
    ]
  );
});
