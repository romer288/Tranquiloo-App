-- Create table to store therapist information linked to users
CREATE TABLE public.user_therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  therapist_name TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('email', 'phone')),
  contact_value TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_therapists ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own therapist info" 
ON public.user_therapists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own therapist info" 
ON public.user_therapists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own therapist info" 
ON public.user_therapists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own therapist info" 
ON public.user_therapists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_user_therapists_updated_at
BEFORE UPDATE ON public.user_therapists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();