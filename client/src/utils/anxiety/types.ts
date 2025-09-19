
export interface FallbackAnxietyAnalysis {
  anxietyLevel: number;
  gad7Score: number;
  beckAnxietyCategories: string[];
  dsm5Indicators: string[];
  triggers: string[];
  emotions: string[];
  cognitiveDistortions: string[];
  recommendedInterventions: string[];
  therapyApproach: 'CBT' | 'DBT' | 'Mindfulness' | 'Trauma-Informed' | 'Supportive';
  crisisRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative' | 'crisis';
  escalationDetected: boolean;
  personalizedResponse?: string;
}

export interface AnalysisKeywords {
  anxietyKeywords: string[];
  depressionKeywords: string[];
  crisisKeywords: string[];
  hallucinationKeywords: string[];
  positiveKeywords: string[];
  negativeKeywords: string[];
}
