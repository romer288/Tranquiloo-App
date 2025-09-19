export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'treatment' | 'self-care' | 'therapy' | 'mindfulness' | 'exercise' | 'social' | 'work' | 'sleep' | 'nutrition';
  target_value?: number;
  unit?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  score: number;
  notes?: string;
  recorded_at: string;
  created_at: string;
}

export interface InterventionSummary {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  intervention_type: string;
  key_points: string[];
  conversation_count: number;
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends Goal {
  latest_progress?: GoalProgress;
  progress_history: GoalProgress[];
  average_score: number;
  completion_rate: number;
}