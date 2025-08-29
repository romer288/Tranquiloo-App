-- Add patient_code column to profiles table for therapist search
ALTER TABLE public.profiles 
ADD COLUMN patient_code TEXT;

-- Create an index for faster code lookups
CREATE INDEX idx_profiles_patient_code ON public.profiles(patient_code);

-- Add a function to generate and assign patient codes
CREATE OR REPLACE FUNCTION public.generate_patient_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 6-digit code
        new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE patient_code = new_code) INTO code_exists;
        
        -- If code doesn't exist, break the loop
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$;