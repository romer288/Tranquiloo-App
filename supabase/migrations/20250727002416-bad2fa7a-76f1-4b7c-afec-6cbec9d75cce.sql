-- Create user_goals table for tracking treatment and self-care goals
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('treatment', 'self-care', 'therapy', 'mindfulness', 'exercise', 'social', 'work', 'sleep', 'nutrition')),
  target_value INTEGER,
  unit TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goal_progress table for tracking daily/weekly progress scores
CREATE TABLE public.goal_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create intervention_summaries table for weekly conversation summaries
CREATE TABLE public.intervention_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  intervention_type TEXT NOT NULL DEFAULT 'conversation',
  key_points TEXT[] NOT NULL DEFAULT '{}',
  conversation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_goals
CREATE POLICY "Users can view their own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for goal_progress
CREATE POLICY "Users can view their own goal progress" ON public.goal_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal progress" ON public.goal_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal progress" ON public.goal_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal progress" ON public.goal_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for intervention_summaries
CREATE POLICY "Users can view their own intervention summaries" ON public.intervention_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own intervention summaries" ON public.intervention_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intervention summaries" ON public.intervention_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intervention summaries" ON public.intervention_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_active ON public.user_goals(user_id, is_active);
CREATE INDEX idx_goal_progress_goal_id ON public.goal_progress(goal_id);
CREATE INDEX idx_goal_progress_user_id ON public.goal_progress(user_id);
CREATE INDEX idx_intervention_summaries_user_id ON public.intervention_summaries(user_id);
CREATE INDEX idx_intervention_summaries_week ON public.intervention_summaries(user_id, week_start, week_end);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intervention_summaries_updated_at
  BEFORE UPDATE ON public.intervention_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();