import axios from 'axios';
import { supabase } from './supabase';
import type {
  AssistantProfile,
  PatientProfile,
  SessionRequest,
  LiveSession,
} from '@/contexts/AppContext';

const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const API_BASE_URL = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');

export const api = axios.create({
  baseURL: `${API_BASE_URL}/rest/v1`,
  headers: {
    'Content-Type': 'application/json',
    apikey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  },
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const assistantApi = {
  async create(profile: Omit<AssistantProfile, 'id'>) {
    const { data } = await api.post('/assistants', {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      photo: profile.photo,
      role: profile.role,
      id_photo: profile.idPhoto,
      other_details: profile.otherDetails,
      services: profile.services,
      pricing_model: profile.pricingModel,
      rate: profile.rate || null,
      rate_min: profile.rateRange?.min || null,
      rate_max: profile.rateRange?.max || null,
      verification_status: profile.verificationStatus,
    });
    return this.mapToAssistantProfile(data[0]);
  },

  async update(id: string, profile: Partial<AssistantProfile>) {
    const updateData: Record<string, unknown> = {};
    if (profile.name) updateData.name = profile.name;
    if (profile.email) updateData.email = profile.email;
    if (profile.phone) updateData.phone = profile.phone;
    if (profile.address) updateData.address = profile.address;
    if (profile.photo) updateData.photo = profile.photo;
    if (profile.role) updateData.role = profile.role;
    if (profile.idPhoto) updateData.id_photo = profile.idPhoto;
    if (profile.otherDetails) updateData.other_details = profile.otherDetails;
    if (profile.services) updateData.services = profile.services;
    if (profile.pricingModel) updateData.pricing_model = profile.pricingModel;
    if (profile.rate !== undefined) updateData.rate = profile.rate;
    if (profile.rateRange) {
      updateData.rate_min = profile.rateRange.min;
      updateData.rate_max = profile.rateRange.max;
    }

    const { data } = await api.patch(`/assistants?id=eq.${id}`, updateData, {
      headers: { Prefer: 'return=representation' },
    });
    return this.mapToAssistantProfile(data[0]);
  },

  async getById(id: string) {
    const { data } = await api.get(`/assistants?id=eq.${id}`);
    return data[0] ? this.mapToAssistantProfile(data[0]) : null;
  },

  async getAll() {
    const { data } = await api.get('/assistants');
    return data.map(this.mapToAssistantProfile);
  },

  async getByHospital(hospitalId: string) {
    const { data } = await api.get(
      `/live_sessions?hospital_id=eq.${hospitalId}&ended_at=is.null&select=assistant_id,assistants(*)`
    );
    return data.map((item: { assistants: Record<string, unknown> }) =>
      this.mapToAssistantProfile(item.assistants)
    );
  },

  mapToAssistantProfile(raw: Record<string, unknown>): AssistantProfile {
    return {
      id: raw.id as string,
      name: raw.name as string,
      email: raw.email as string,
      phone: raw.phone as string,
      address: raw.address as string,
      photo: raw.photo as string,
      role: raw.role as string,
      idPhoto: raw.id_photo as string,
      otherDetails: raw.other_details as string,
      services: raw.services as string[],
      pricingModel: raw.pricing_model as 'fixed' | 'hourly' | 'bespoke',
      rate: raw.rate as number | undefined,
      rateRange:
        raw.rate_min && raw.rate_max
          ? { min: raw.rate_min as number, max: raw.rate_max as number }
          : undefined,
      verificationStatus: raw.verification_status as 'verified' | 'pending' | 'rejected',
    };
  },
};

export const patientApi = {
  async create(profile: Omit<PatientProfile, 'id'>) {
    const { data } = await api.post('/patients', {
      name: profile.name,
      contact: profile.contact,
      location: profile.location,
      is_patient: profile.isPatient,
      has_insurance: profile.hasInsurance,
      insurance_provider: profile.insuranceProvider || null,
      insurance_number: profile.insuranceNumber || null,
      has_card: profile.hasCard,
      card_photo: profile.cardPhoto || null,
      card_details: profile.cardDetails || null,
      id_photo: profile.idPhoto || null,
    });
    return this.mapToPatientProfile(data[0]);
  },

  async update(id: string, profile: Partial<PatientProfile>) {
    const updateData: Record<string, unknown> = {};
    if (profile.name) updateData.name = profile.name;
    if (profile.contact) updateData.contact = profile.contact;
    if (profile.location) updateData.location = profile.location;
    if (profile.isPatient !== undefined) updateData.is_patient = profile.isPatient;
    if (profile.hasInsurance !== undefined) updateData.has_insurance = profile.hasInsurance;
    if (profile.insuranceProvider) updateData.insurance_provider = profile.insuranceProvider;
    if (profile.insuranceNumber) updateData.insurance_number = profile.insuranceNumber;
    if (profile.hasCard !== undefined) updateData.has_card = profile.hasCard;
    if (profile.cardPhoto) updateData.card_photo = profile.cardPhoto;
    if (profile.cardDetails) updateData.card_details = profile.cardDetails;
    if (profile.idPhoto) updateData.id_photo = profile.idPhoto;

    const { data } = await api.patch(`/patients?id=eq.${id}`, updateData, {
      headers: { Prefer: 'return=representation' },
    });
    return this.mapToPatientProfile(data[0]);
  },

  async getById(id: string) {
    const { data } = await api.get(`/patients?id=eq.${id}`);
    return data[0] ? this.mapToPatientProfile(data[0]) : null;
  },

  mapToPatientProfile(raw: Record<string, unknown>): PatientProfile {
    return {
      id: raw.id as string,
      name: raw.name as string,
      contact: raw.contact as string,
      location: raw.location as string,
      isPatient: raw.is_patient as boolean,
      hasInsurance: raw.has_insurance as boolean,
      insuranceProvider: raw.insurance_provider as string | undefined,
      insuranceNumber: raw.insurance_number as string | undefined,
      hasCard: raw.has_card as boolean,
      cardPhoto: raw.card_photo as string | undefined,
      cardDetails: raw.card_details as string | undefined,
      idPhoto: raw.id_photo as string | undefined,
    };
  },
};

export const sessionApi = {
  async create(session: Omit<SessionRequest, 'id' | 'createdAt'>) {
    const { data } = await api.post('/sessions', {
      patient_id: session.patientId,
      patient_name: session.patientName,
      patient_gender: session.patientGender,
      patient_age_range: session.patientAgeRange,
      special_service: session.specialService || null,
      hospital_id: session.hospitalId,
      hospital_name: session.hospitalName,
      assistant_id: session.assistantId || null,
      status: session.status,
      accepted_at: session.acceptedAt || null,
      completed_at: session.completedAt || null,
      requester_name: session.requesterName,
      is_requester_patient: session.isRequesterPatient,
      estimated_arrival: session.estimatedArrival,
      location: session.location || null,
      has_insurance: session.hasInsurance || null,
      insurance_provider: session.insuranceProvider || null,
      has_card: session.hasCard || null,
      notes: session.notes || null,
      invoice_amount: session.invoice?.amount || null,
      invoice_review: session.invoice?.review || null,
      invoice_paid_at: session.invoice?.paidAt || null,
    });
    return this.mapToSessionRequest(data[0]);
  },

  async update(id: string, updates: Partial<SessionRequest>) {
    const updateData: Record<string, unknown> = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.acceptedAt) updateData.accepted_at = updates.acceptedAt;
    if (updates.completedAt) updateData.completed_at = updates.completedAt;
    if (updates.assistantId) updateData.assistant_id = updates.assistantId;
    if (updates.notes) updateData.notes = updates.notes;
    if (updates.invoice) {
      updateData.invoice_amount = updates.invoice.amount;
      updateData.invoice_review = updates.invoice.review || null;
      updateData.invoice_paid_at = updates.invoice.paidAt || null;
    }

    const { data } = await api.patch(`/sessions?id=eq.${id}`, updateData, {
      headers: { Prefer: 'return=representation' },
    });
    return this.mapToSessionRequest(data[0]);
  },

  async getById(id: string) {
    const { data } = await api.get(`/sessions?id=eq.${id}`);
    return data[0] ? this.mapToSessionRequest(data[0]) : null;
  },

  async getAll() {
    const { data } = await api.get('/sessions?order=created_at.desc');
    return data.map(this.mapToSessionRequest);
  },

  async getByAssistant(assistantId: string) {
    const { data } = await api.get(`/sessions?assistant_id=eq.${assistantId}&order=created_at.desc`);
    return data.map(this.mapToSessionRequest);
  },

  async getByStatus(status: string) {
    const { data } = await api.get(`/sessions?status=eq.${status}&order=created_at.desc`);
    return data.map(this.mapToSessionRequest);
  },

  async getOpenRequests() {
    const { data } = await api.get(
      `/sessions?status=in.(pending,accepted)&order=created_at.desc`
    );
    return data.map(this.mapToSessionRequest);
  },

  mapToSessionRequest(raw: Record<string, unknown>): SessionRequest {
    return {
      id: raw.id as string,
      patientId: raw.patient_id as string,
      patientName: raw.patient_name as string,
      patientGender: raw.patient_gender as string,
      patientAgeRange: raw.patient_age_range as string,
      specialService: raw.special_service as string | undefined,
      hospitalId: raw.hospital_id as string,
      hospitalName: raw.hospital_name as string,
      assistantId: raw.assistant_id as string | undefined,
      status: raw.status as SessionRequest['status'],
      createdAt: raw.created_at as string,
      acceptedAt: raw.accepted_at as string | undefined,
      completedAt: raw.completed_at as string | undefined,
      requesterName: raw.requester_name as string,
      isRequesterPatient: raw.is_requester_patient as boolean,
      estimatedArrival: raw.estimated_arrival as string,
      location: raw.location as string | undefined,
      hasInsurance: raw.has_insurance as boolean | undefined,
      insuranceProvider: raw.insurance_provider as string | undefined,
      hasCard: raw.has_card as boolean | undefined,
      notes: raw.notes as string | undefined,
      invoice:
        raw.invoice_amount !== null
          ? {
              amount: raw.invoice_amount as number,
              review: raw.invoice_review as string | undefined,
              paidAt: raw.invoice_paid_at as string | undefined,
            }
          : undefined,
    };
  },
};

export const liveSessionApi = {
  async create(assistantId: string, session: Omit<LiveSession, 'startedAt'>) {
    const { data } = await api.post('/live_sessions', {
      assistant_id: assistantId,
      hospital_id: session.hospitalId,
      hospital_name: session.hospitalName,
      from_date: session.fromDate,
      from_time: session.fromTime,
      to_date: session.toDate,
      to_time: session.toTime,
      started_at: new Date().toISOString(),
    });
    return this.mapToLiveSession(data[0]);
  },

  async end(assistantId: string, notes?: string) {
    const { data } = await api.patch(
      `/live_sessions?assistant_id=eq.${assistantId}&ended_at=is.null`,
      {
        ended_at: new Date().toISOString(),
        offline_notes: notes || null,
      },
      { headers: { Prefer: 'return=representation' } }
    );
    return data[0] ? this.mapToLiveSession(data[0]) : null;
  },

  async getActive(assistantId: string) {
    const { data } = await api.get(
      `/live_sessions?assistant_id=eq.${assistantId}&ended_at=is.null`
    );
    return data[0] ? this.mapToLiveSession(data[0]) : null;
  },

  mapToLiveSession(raw: Record<string, unknown>): LiveSession {
    return {
      hospitalId: raw.hospital_id as string,
      hospitalName: raw.hospital_name as string,
      fromDate: raw.from_date as string,
      fromTime: raw.from_time as string,
      toDate: raw.to_date as string,
      toTime: raw.to_time as string,
      startedAt: raw.started_at as string,
    };
  },
};

export const hospitalApi = {
  async getAll() {
    const { data } = await api.get('/hospitals');
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/hospitals?id=eq.${id}`);
    return data[0] || null;
  },

  async seedHospitals() {
    const hospitals = [
      {
        name: 'Korle Bu Teaching Hospital',
        location: 'Korle Bu, Accra',
        city: 'Accra',
      },
      {
        name: '37 Military Hospital',
        location: 'Burma Camp, Accra',
        city: 'Accra',
      },
      {
        name: 'Ridge Hospital',
        location: 'Ridge, Accra',
        city: 'Accra',
      },
      {
        name: 'Komfo Anokye Teaching Hospital',
        location: 'Bantama, Kumasi',
        city: 'Kumasi',
      },
      {
        name: 'Tema General Hospital',
        location: 'Community 2, Tema',
        city: 'Tema',
      },
      {
        name: 'Lekma Hospital',
        location: 'Teshie, Accra',
        city: 'Accra',
      },
      {
        name: 'Greater Accra Regional Hospital',
        location: 'Ridge, Accra',
        city: 'Accra',
      },
      {
        name: 'Nyaho Medical Centre',
        location: 'Airport Residential Area, Accra',
        city: 'Accra',
      },
    ];

    for (const hospital of hospitals) {
      try {
        await api.post('/hospitals', hospital);
      } catch {
        console.log('Hospital already exists or error:', hospital.name);
      }
    }
  },
};
