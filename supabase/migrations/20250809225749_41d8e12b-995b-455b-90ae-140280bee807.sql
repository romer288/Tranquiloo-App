-- Allow therapists to view patient anxiety analyses
CREATE POLICY "Therapists can view patient anxiety analyses" 
ON public.anxiety_analyses 
FOR SELECT 
USING (
  -- Allow if the requesting user is a therapist
  (public.get_current_user_role() = 'therapist')
  AND 
  -- And the target user is a patient (check via profiles table)
  (user_id IN (SELECT id FROM public.profiles WHERE role = 'patient'))
);