import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase credentials are missing!');
  console.error('supabaseUrl:', supabaseUrl || 'MISSING');
  console.error('supabaseAnonKey:', supabaseAnonKey ? 'SET (hidden)' : 'MISSING');
  console.error('\nPlease ensure your .env file exists with:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your-url');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key');
  console.error('\nThen restart your dev server with: npx expo start --clear');
}

const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      assistants: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          photo: string;
          role: string;
          id_photo: string;
          other_details: string;
          services: string[];
          pricing_model: 'fixed' | 'hourly' | 'bespoke';
          rate: number | null;
          rate_min: number | null;
          rate_max: number | null;
          verification_status: 'verified' | 'pending' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assistants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assistants']['Insert']>;
      };
      patients: {
        Row: {
          id: string;
          name: string;
          contact: string;
          location: string;
          is_patient: boolean;
          has_insurance: boolean;
          insurance_provider: string | null;
          insurance_number: string | null;
          has_card: boolean;
          card_photo: string | null;
          card_details: string | null;
          id_photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      hospitals: {
        Row: {
          id: string;
          name: string;
          location: string;
          city: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hospitals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hospitals']['Insert']>;
      };
      sessions: {
        Row: {
          id: string;
          patient_id: string;
          patient_name: string;
          patient_gender: string;
          patient_age_range: string;
          special_service: string | null;
          hospital_id: string;
          hospital_name: string;
          assistant_id: string | null;
          status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'declined';
          created_at: string;
          accepted_at: string | null;
          completed_at: string | null;
          requester_name: string;
          is_requester_patient: boolean;
          estimated_arrival: string;
          location: string | null;
          has_insurance: boolean | null;
          insurance_provider: string | null;
          has_card: boolean | null;
          notes: string | null;
          invoice_amount: number | null;
          invoice_review: string | null;
          invoice_paid_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
      };
      live_sessions: {
        Row: {
          id: string;
          assistant_id: string;
          hospital_id: string;
          hospital_name: string;
          from_date: string;
          from_time: string;
          to_date: string;
          to_time: string;
          started_at: string;
          ended_at: string | null;
          offline_notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['live_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['live_sessions']['Insert']>;
      };
      session_media: {
        Row: {
          id: string;
          session_id: string;
          uri: string;
          type: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['session_media']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['session_media']['Insert']>;
      };
    };
  };
};
