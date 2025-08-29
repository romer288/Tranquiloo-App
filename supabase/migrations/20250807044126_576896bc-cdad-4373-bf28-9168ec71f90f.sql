-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'therapist'));