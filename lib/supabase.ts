import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton for async client (with AsyncStorage)
let supabaseInstance: SupabaseClient | null = null;

// Helper for environment vars
const getEnvVar = (key: string): string =>
  (typeof process !== "undefined" && process.env ? process.env[key] : "") || "";

const supabaseUrl = getEnvVar("EXPO_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY");

// Dynamically load AsyncStorage only on client
const getAsyncStorage = async () => {
  if (typeof window === "undefined") return undefined;
  const mod = await import("@react-native-async-storage/async-storage");
  return mod.default;
};

const createSupabaseClient = async (): Promise<SupabaseClient> => {
  const storage = await getAsyncStorage();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

// Public getter: ensures a single instance (async)
export const getSupabase = async (): Promise<SupabaseClient> => {
  if (!supabaseInstance) {
    supabaseInstance = await createSupabaseClient();
  }
  return supabaseInstance;
};

// Simple synchronous client for backend/server use (no AsyncStorage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export type { SupabaseClient };
