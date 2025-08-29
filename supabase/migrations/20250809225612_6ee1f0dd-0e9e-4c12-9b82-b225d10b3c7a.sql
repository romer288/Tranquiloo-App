-- Drop the problematic policy first
DROP POLICY IF EXISTS "Therapists can view patient profiles" ON public.profiles;

-- Create a security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create the correct policy using the security definer function
CREATE POLICY "Therapists can view patient profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if the requesting user is a therapist
  (public.get_current_user_role() = 'therapist')
  AND 
  -- And the target profile is a patient
  (role = 'patient')
);