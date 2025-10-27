-- Migration to add profile_id column to existing tables
-- Run this if you get "column profile_id does not exist" error

-- Add profile_id to home_care_requests if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'home_care_requests' 
        AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE public.home_care_requests 
        ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
        
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_home_care_profile ON public.home_care_requests(profile_id);
    END IF;
END $$;

-- Add profile_id to health_supplies_requests if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'health_supplies_requests' 
        AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE public.health_supplies_requests 
        ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
        
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_health_supplies_profile ON public.health_supplies_requests(profile_id);
    END IF;
END $$;
