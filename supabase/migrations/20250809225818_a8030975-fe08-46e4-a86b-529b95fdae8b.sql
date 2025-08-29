-- Allow therapists to view patient chat messages
CREATE POLICY "Therapists can view patient chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  -- Allow if the requesting user is a therapist
  (public.get_current_user_role() = 'therapist')
  AND 
  -- And the target user is a patient (check via profiles table)
  (user_id IN (SELECT id FROM public.profiles WHERE role = 'patient'))
);

-- Allow therapists to view patient goals
CREATE POLICY "Therapists can view patient goals" 
ON public.user_goals 
FOR SELECT 
USING (
  -- Allow if the requesting user is a therapist
  (public.get_current_user_role() = 'therapist')
  AND 
  -- And the target user is a patient (check via profiles table)
  (user_id IN (SELECT id FROM public.profiles WHERE role = 'patient'))
);

-- Allow therapists to view patient goal progress
CREATE POLICY "Therapists can view patient goal progress" 
ON public.goal_progress 
FOR SELECT 
USING (
  -- Allow if the requesting user is a therapist
  (public.get_current_user_role() = 'therapist')
  AND 
  -- And the target user is a patient (check via profiles table)
  (user_id IN (SELECT id FROM public.profiles WHERE role = 'patient'))
);