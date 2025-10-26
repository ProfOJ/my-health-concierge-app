-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create assistants table
CREATE TABLE IF NOT EXISTS public.assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    photo TEXT NOT NULL,
    role TEXT NOT NULL,
    id_photo TEXT NOT NULL,
    other_details TEXT,
    services TEXT[] NOT NULL DEFAULT '{}',
    pricing_model TEXT NOT NULL CHECK (pricing_model IN ('fixed', 'hourly', 'bespoke')),
    rate NUMERIC,
    rate_min NUMERIC,
    rate_max NUMERIC,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    location TEXT NOT NULL,
    is_patient BOOLEAN NOT NULL DEFAULT true,
    has_insurance BOOLEAN NOT NULL DEFAULT false,
    insurance_provider TEXT,
    insurance_number TEXT,
    has_card BOOLEAN NOT NULL DEFAULT false,
    card_photo TEXT,
    card_details TEXT,
    id_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_gender TEXT NOT NULL,
    patient_age_range TEXT NOT NULL,
    special_service TEXT,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    assistant_id UUID REFERENCES public.assistants(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    requester_name TEXT NOT NULL,
    is_requester_patient BOOLEAN NOT NULL DEFAULT true,
    estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    has_insurance BOOLEAN,
    insurance_provider TEXT,
    has_card BOOLEAN,
    notes TEXT,
    invoice_amount NUMERIC,
    invoice_review TEXT,
    invoice_paid_at TIMESTAMP WITH TIME ZONE
);

-- Create live_sessions table
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    from_date TEXT NOT NULL,
    from_time TEXT NOT NULL,
    to_date TEXT NOT NULL,
    to_time TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    offline_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create session_media table
CREATE TABLE IF NOT EXISTS public.session_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    uri TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assistants_email ON public.assistants(email);
CREATE INDEX IF NOT EXISTS idx_assistants_verification ON public.assistants(verification_status);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_assistant ON public.sessions(assistant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON public.sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_hospital ON public.sessions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_sessions_assistant ON public.live_sessions(assistant_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_active ON public.live_sessions(assistant_id, ended_at) WHERE ended_at IS NULL;

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_assistants_updated_at ON public.assistants;
CREATE TRIGGER update_assistants_updated_at
    BEFORE UPDATE ON public.assistants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_media ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
-- For development, we'll allow all operations without authentication.
-- In production, you should restrict these policies based on authenticated users.

-- Hospitals policies (allow all anonymous operations)
DROP POLICY IF EXISTS "Allow public read access to hospitals" ON public.hospitals;
CREATE POLICY "Allow all access to hospitals" ON public.hospitals
    FOR ALL USING (true) WITH CHECK (true);

-- Assistants policies (allow all anonymous operations)
DROP POLICY IF EXISTS "Allow public read access to assistants" ON public.assistants;
DROP POLICY IF EXISTS "Allow insert for assistants" ON public.assistants;
DROP POLICY IF EXISTS "Allow update for assistants" ON public.assistants;
CREATE POLICY "Allow all access to assistants" ON public.assistants
    FOR ALL USING (true) WITH CHECK (true);

-- Patients policies (allow all anonymous operations)
DROP POLICY IF EXISTS "Allow public read access to patients" ON public.patients;
DROP POLICY IF EXISTS "Allow insert for patients" ON public.patients;
DROP POLICY IF EXISTS "Allow update for patients" ON public.patients;
CREATE POLICY "Allow all access to patients" ON public.patients
    FOR ALL USING (true) WITH CHECK (true);

-- Sessions policies (allow all anonymous operations)
DROP POLICY IF EXISTS "Allow public read access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow insert for sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow update for sessions" ON public.sessions;
CREATE POLICY "Allow all access to sessions" ON public.sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Live sessions policies (allow all anonymous operations)
DROP POLICY IF EXISTS "Allow public read access to live_sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow insert for live_sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow update for live_sessions" ON public.live_sessions;
CREATE POLICY "Allow all access to live_sessions" ON public.live_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Session media policies (allow all anonymous operations)
DROP POLICY IF EXISTS "Allow public read access to session_media" ON public.session_media;
DROP POLICY IF EXISTS "Allow insert for session_media" ON public.session_media;
CREATE POLICY "Allow all access to session_media" ON public.session_media
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample hospitals data
INSERT INTO public.hospitals (name, location, city) VALUES
    ('Korle Bu Teaching Hospital', 'Korle Bu, Accra', 'Accra'),
    ('37 Military Hospital', 'Burma Camp, Accra', 'Accra'),
    ('Ridge Hospital', 'Ridge, Accra', 'Accra'),
    ('Komfo Anokye Teaching Hospital', 'Bantama, Kumasi', 'Kumasi'),
    ('Tema General Hospital', 'Community 2, Tema', 'Tema'),
    ('Lekma Hospital', 'Teshie, Accra', 'Accra'),
    ('Greater Accra Regional Hospital', 'Ridge, Accra', 'Accra'),
    ('Nyaho Medical Centre', 'Airport Residential Area, Accra', 'Accra')
ON CONFLICT DO NOTHING;
