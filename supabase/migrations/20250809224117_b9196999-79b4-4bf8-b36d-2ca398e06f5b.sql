-- Allow therapists to view patient profiles for search functionality
CREATE POLICY "Therapists can view patient profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if the requesting user is a therapist
  (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'therapist'))
  AND 
  -- And the target profile is a patient
  (role = 'patient')
);