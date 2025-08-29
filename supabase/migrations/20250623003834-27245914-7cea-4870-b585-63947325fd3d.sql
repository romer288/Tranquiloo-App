
-- Add only the missing RLS policies that don't exist yet

-- For anxiety_analyses table - add missing UPDATE and DELETE policies
CREATE POLICY "Users can update their own anxiety analyses" 
  ON public.anxiety_analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anxiety analyses" 
  ON public.anxiety_analyses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- For chat_messages table - add missing UPDATE and DELETE policies
CREATE POLICY "Users can update their own chat messages" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" 
  ON public.chat_messages 
  FOR DELETE 
  USING (auth.uid() = user_id);
