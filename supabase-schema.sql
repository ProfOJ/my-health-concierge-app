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

-- Create hospital assistance sessions table
CREATE TABLE IF NOT EXISTS public.hospital_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_gender TEXT NOT NULL,
    patient_age_range TEXT NOT NULL,
    special_service TEXT,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    assistant_id UUID REFERENCES public.assistants(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'declined', 'cancelled')),
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

-- Create home care requests table
CREATE TABLE IF NOT EXISTS public.home_care_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    is_patient BOOLEAN NOT NULL,
    patient_gender TEXT,
    patient_age TEXT,
    services TEXT[] NOT NULL,
    is_at_location BOOLEAN NOT NULL,
    contact_person TEXT,
    patient_name TEXT,
    requester_name TEXT NOT NULL,
    requester_contact TEXT NOT NULL,
    assistant_id UUID REFERENCES public.assistants(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in-progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    invoice_amount NUMERIC,
    invoice_paid_at TIMESTAMP WITH TIME ZONE
);

-- Create health supplies requests table
CREATE TABLE IF NOT EXISTS public.health_supplies_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    has_prescription BOOLEAN NOT NULL,
    what_needed TEXT,
    delivery_address TEXT NOT NULL,
    delivery_latitude NUMERIC,
    delivery_longitude NUMERIC,
    urgency TEXT NOT NULL CHECK (urgency IN ('urgent', 'not-urgent', 'flexible')),
    flexible_date TIMESTAMP WITH TIME ZONE,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('myself', 'someone-else')),
    recipient_name TEXT,
    recipient_gender TEXT,
    recipient_age TEXT,
    requester_name TEXT NOT NULL,
    requester_contact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'out-for-delivery', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    processed_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    total_amount NUMERIC,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create prescription images table
CREATE TABLE IF NOT EXISTS public.prescription_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_supplies_request_id UUID NOT NULL REFERENCES public.health_supplies_requests(id) ON DELETE CASCADE,
    image_uri TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
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

-- Create session_media table for hospital sessions
CREATE TABLE IF NOT EXISTS public.session_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.hospital_sessions(id) ON DELETE CASCADE,
    uri TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assistants_email ON public.assistants(email);
CREATE INDEX IF NOT EXISTS idx_assistants_verification ON public.assistants(verification_status);
CREATE INDEX IF NOT EXISTS idx_hospital_sessions_status ON public.hospital_sessions(status);
CREATE INDEX IF NOT EXISTS idx_hospital_sessions_assistant ON public.hospital_sessions(assistant_id);
CREATE INDEX IF NOT EXISTS idx_hospital_sessions_patient ON public.hospital_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_hospital_sessions_hospital ON public.hospital_sessions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_sessions_created ON public.hospital_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_home_care_status ON public.home_care_requests(status);
CREATE INDEX IF NOT EXISTS idx_home_care_assistant ON public.home_care_requests(assistant_id);
CREATE INDEX IF NOT EXISTS idx_home_care_created ON public.home_care_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_supplies_status ON public.health_supplies_requests(status);
CREATE INDEX IF NOT EXISTS idx_health_supplies_urgency ON public.health_supplies_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_health_supplies_created ON public.health_supplies_requests(created_at DESC);
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
ALTER TABLE public.hospital_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_care_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_supplies_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_media ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
-- For development, we'll allow all operations without authentication.
-- In production, you should restrict these policies based on authenticated users.

-- Hospitals policies
DROP POLICY IF EXISTS "Allow all access to hospitals" ON public.hospitals;
CREATE POLICY "Allow all access to hospitals" ON public.hospitals
    FOR ALL USING (true) WITH CHECK (true);

-- Assistants policies
DROP POLICY IF EXISTS "Allow all access to assistants" ON public.assistants;
CREATE POLICY "Allow all access to assistants" ON public.assistants
    FOR ALL USING (true) WITH CHECK (true);

-- Patients policies
DROP POLICY IF EXISTS "Allow all access to patients" ON public.patients;
CREATE POLICY "Allow all access to patients" ON public.patients
    FOR ALL USING (true) WITH CHECK (true);

-- Hospital sessions policies
DROP POLICY IF EXISTS "Allow all access to hospital_sessions" ON public.hospital_sessions;
CREATE POLICY "Allow all access to hospital_sessions" ON public.hospital_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Home care requests policies
DROP POLICY IF EXISTS "Allow all access to home_care_requests" ON public.home_care_requests;
CREATE POLICY "Allow all access to home_care_requests" ON public.home_care_requests
    FOR ALL USING (true) WITH CHECK (true);

-- Health supplies requests policies
DROP POLICY IF EXISTS "Allow all access to health_supplies_requests" ON public.health_supplies_requests;
CREATE POLICY "Allow all access to health_supplies_requests" ON public.health_supplies_requests
    FOR ALL USING (true) WITH CHECK (true);

-- Prescription images policies
DROP POLICY IF EXISTS "Allow all access to prescription_images" ON public.prescription_images;
CREATE POLICY "Allow all access to prescription_images" ON public.prescription_images
    FOR ALL USING (true) WITH CHECK (true);

-- Live sessions policies
DROP POLICY IF EXISTS "Allow all access to live_sessions" ON public.live_sessions;
CREATE POLICY "Allow all access to live_sessions" ON public.live_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Session media policies
DROP POLICY IF EXISTS "Allow all access to session_media" ON public.session_media;
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

-- Function to create hospital session with patient data
CREATE OR REPLACE FUNCTION create_hospital_session(
    p_patient_data JSONB,
    p_session_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_patient_id UUID;
    v_session_id UUID;
BEGIN
    -- Insert or update patient
    INSERT INTO public.patients (
        name, contact, location, is_patient,
        has_insurance, insurance_provider, insurance_number,
        has_card, card_details
    ) VALUES (
        p_patient_data->>'name',
        p_patient_data->>'contact',
        p_patient_data->>'location',
        (p_patient_data->>'isPatient')::BOOLEAN,
        (p_patient_data->>'hasInsurance')::BOOLEAN,
        p_patient_data->>'insuranceProvider',
        p_patient_data->>'insuranceNumber',
        (p_patient_data->>'hasCard')::BOOLEAN,
        p_patient_data->>'cardDetails'
    ) RETURNING id INTO v_patient_id;
    
    -- Insert session
    INSERT INTO public.hospital_sessions (
        patient_id, patient_name, patient_gender, patient_age_range,
        special_service, hospital_id, hospital_name, requester_name,
        is_requester_patient, estimated_arrival, location,
        has_insurance, insurance_provider, has_card, notes
    ) VALUES (
        v_patient_id,
        p_session_data->>'patientName',
        p_session_data->>'patientGender',
        p_session_data->>'patientAgeRange',
        p_session_data->>'specialService',
        (p_session_data->>'hospitalId')::UUID,
        p_session_data->>'hospitalName',
        p_patient_data->>'name',
        (p_patient_data->>'isPatient')::BOOLEAN,
        (p_session_data->>'estimatedArrival')::TIMESTAMP WITH TIME ZONE,
        p_patient_data->>'location',
        (p_patient_data->>'hasInsurance')::BOOLEAN,
        p_patient_data->>'insuranceProvider',
        (p_patient_data->>'hasCard')::BOOLEAN,
        p_session_data->>'notes'
    ) RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create home care request
CREATE OR REPLACE FUNCTION create_home_care_request(
    p_request_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
BEGIN
    INSERT INTO public.home_care_requests (
        address, latitude, longitude, is_patient,
        patient_gender, patient_age, services,
        is_at_location, contact_person, patient_name,
        requester_name, requester_contact
    ) VALUES (
        p_request_data->>'address',
        (p_request_data->>'latitude')::NUMERIC,
        (p_request_data->>'longitude')::NUMERIC,
        (p_request_data->>'isPatient')::BOOLEAN,
        p_request_data->>'gender',
        p_request_data->>'age',
        ARRAY(SELECT jsonb_array_elements_text(p_request_data->'services')),
        (p_request_data->>'isAtLocation')::BOOLEAN,
        p_request_data->>'contactPerson',
        p_request_data->>'patientName',
        p_request_data->>'requesterName',
        p_request_data->>'requesterContact'
    ) RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create health supplies request
CREATE OR REPLACE FUNCTION create_health_supplies_request(
    p_request_data JSONB,
    p_prescription_images TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_image TEXT;
BEGIN
    INSERT INTO public.health_supplies_requests (
        has_prescription, what_needed, delivery_address,
        delivery_latitude, delivery_longitude, urgency,
        flexible_date, recipient_type, recipient_name,
        recipient_gender, recipient_age, requester_name,
        requester_contact
    ) VALUES (
        (p_request_data->>'hasPrescription')::BOOLEAN,
        p_request_data->>'whatDoYouNeed',
        p_request_data->>'deliveryAddress',
        (p_request_data->>'deliveryLatitude')::NUMERIC,
        (p_request_data->>'deliveryLongitude')::NUMERIC,
        p_request_data->>'urgency',
        (p_request_data->>'flexibleDate')::TIMESTAMP WITH TIME ZONE,
        p_request_data->>'recipientType',
        p_request_data->>'recipientName',
        p_request_data->>'recipientGender',
        p_request_data->>'recipientAge',
        p_request_data->>'requesterName',
        p_request_data->>'requesterContact'
    ) RETURNING id INTO v_request_id;
    
    -- Insert prescription images if provided
    IF p_prescription_images IS NOT NULL THEN
        FOREACH v_image IN ARRAY p_prescription_images
        LOOP
            INSERT INTO public.prescription_images (
                health_supplies_request_id, image_uri
            ) VALUES (v_request_id, v_image);
        END LOOP;
    END IF;
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all requests for an assistant
CREATE OR REPLACE FUNCTION get_assistant_requests(
    p_assistant_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'hospital_sessions', (
            SELECT COALESCE(jsonb_agg(row_to_json(hs.*)), '[]'::jsonb)
            FROM public.hospital_sessions hs
            WHERE hs.assistant_id = p_assistant_id
            ORDER BY hs.created_at DESC
        ),
        'home_care_requests', (
            SELECT COALESCE(jsonb_agg(row_to_json(hc.*)), '[]'::jsonb)
            FROM public.home_care_requests hc
            WHERE hc.assistant_id = p_assistant_id
            ORDER BY hc.created_at DESC
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending requests by location/hospital
CREATE OR REPLACE FUNCTION get_pending_requests(
    p_hospital_id UUID DEFAULT NULL,
    p_location TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'hospital_sessions', (
            SELECT COALESCE(jsonb_agg(row_to_json(hs.*)), '[]'::jsonb)
            FROM public.hospital_sessions hs
            WHERE hs.status = 'pending'
            AND (p_hospital_id IS NULL OR hs.hospital_id = p_hospital_id)
            ORDER BY hs.created_at DESC
        ),
        'home_care_requests', (
            SELECT COALESCE(jsonb_agg(row_to_json(hc.*)), '[]'::jsonb)
            FROM public.home_care_requests hc
            WHERE hc.status = 'pending'
            ORDER BY hc.created_at DESC
        ),
        'health_supplies_requests', (
            SELECT COALESCE(jsonb_agg(row_to_json(hs.*)), '[]'::jsonb)
            FROM public.health_supplies_requests hs
            WHERE hs.status = 'pending'
            ORDER BY hs.created_at DESC
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to assign assistant to request
CREATE OR REPLACE FUNCTION assign_assistant_to_request(
    p_request_type TEXT,
    p_request_id UUID,
    p_assistant_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    IF p_request_type = 'hospital_session' THEN
        UPDATE public.hospital_sessions
        SET assistant_id = p_assistant_id,
            status = 'accepted',
            accepted_at = TIMEZONE('utc', NOW())
        WHERE id = p_request_id;
    ELSIF p_request_type = 'home_care' THEN
        UPDATE public.home_care_requests
        SET assistant_id = p_assistant_id,
            status = 'assigned',
            accepted_at = TIMEZONE('utc', NOW())
        WHERE id = p_request_id;
    ELSE
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to complete request
CREATE OR REPLACE FUNCTION complete_request(
    p_request_type TEXT,
    p_request_id UUID,
    p_invoice_amount NUMERIC DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    IF p_request_type = 'hospital_session' THEN
        UPDATE public.hospital_sessions
        SET status = 'completed',
            completed_at = TIMEZONE('utc', NOW()),
            invoice_amount = COALESCE(p_invoice_amount, invoice_amount),
            notes = COALESCE(p_notes, notes)
        WHERE id = p_request_id;
    ELSIF p_request_type = 'home_care' THEN
        UPDATE public.home_care_requests
        SET status = 'completed',
            completed_at = TIMEZONE('utc', NOW()),
            invoice_amount = COALESCE(p_invoice_amount, invoice_amount),
            notes = COALESCE(p_notes, notes)
        WHERE id = p_request_id;
    ELSIF p_request_type = 'health_supplies' THEN
        UPDATE public.health_supplies_requests
        SET status = 'delivered',
            delivered_at = TIMEZONE('utc', NOW()),
            total_amount = COALESCE(p_invoice_amount, total_amount),
            notes = COALESCE(p_notes, notes)
        WHERE id = p_request_id;
    ELSE
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
