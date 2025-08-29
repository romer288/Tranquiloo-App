-- Create therapists table for storing scraped therapist data
CREATE TABLE public.therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  bio TEXT,
  insurance TEXT[] DEFAULT '{}',
  accepting_patients BOOLEAN DEFAULT true,
  accepts_uninsured BOOLEAN DEFAULT false,
  licensure TEXT NOT NULL,
  website TEXT,
  practice_type TEXT DEFAULT 'individual',
  years_of_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

-- Create policies for therapist data access
CREATE POLICY "Therapists are viewable by authenticated users" 
ON public.therapists 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create index for better search performance
CREATE INDEX idx_therapists_state ON public.therapists(state);
CREATE INDEX idx_therapists_specialty ON public.therapists USING GIN(specialty);
CREATE INDEX idx_therapists_insurance ON public.therapists USING GIN(insurance);
CREATE INDEX idx_therapists_zip_code ON public.therapists(zip_code);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_therapists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_therapists_updated_at();