-- Fix incorrect therapist roles - these users should be patients based on their emails
-- Only keep alexbeckher61@gmail.com as therapist, change arth.rombus@gmail.com to patient

UPDATE profiles 
SET role = 'patient' 
WHERE email = 'arth.rombus@gmail.com' AND role = 'therapist';

-- Add a comment to explain the fix
-- This fixes users who were incorrectly assigned therapist role during OAuth registration