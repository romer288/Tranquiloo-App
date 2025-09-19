
import { FallbackAnxietyAnalysis } from './types';

export const generateRecommendedInterventions = (crisisRiskLevel: string): string[] => {
  const interventions = [
    'Practice deep breathing exercises',
    'Try progressive muscle relaxation',
    'Use grounding techniques (5-4-3-2-1 method)',
    'Consider journaling your thoughts'
  ];
  
  if (crisisRiskLevel === 'critical') {
    interventions.unshift('Contact crisis hotline immediately', 'Reach out to emergency services if needed');
  }
  
  return interventions;
};

export const generateBeckAnxietyCategories = (emotions: string[], lowerMessage: string): string[] => {
  const categories = [];
  
  if (emotions.includes('anxiety')) {
    categories.push('Subjective anxiety');
  }
  if (lowerMessage.includes('heart') || lowerMessage.includes('breathing')) {
    categories.push('Physical symptoms');
  }
  
  return categories;
};

export const generateDsm5Indicators = (anxietyLevel: number, triggers: string[]): string[] => {
  const indicators = [];
  
  if (anxietyLevel >= 6) {
    indicators.push('Excessive anxiety present');
  }
  if (triggers.length > 1) {
    indicators.push('Multiple anxiety triggers identified');
  }
  
  return indicators;
};

export const determineTherapyApproach = (
  cognitiveDistortions: string[], 
  crisisRiskLevel: string, 
  emotions: string[], 
  triggers: string[]
): 'CBT' | 'DBT' | 'Mindfulness' | 'Trauma-Informed' | 'Supportive' => {
  if (cognitiveDistortions.length > 0) {
    return 'CBT';
  } else if (crisisRiskLevel === 'high' || crisisRiskLevel === 'critical') {
    return 'Trauma-Informed';
  } else if (emotions.includes('anxiety') && triggers.length > 0) {
    return 'Mindfulness';
  }
  return 'Supportive';
};

export const determineCrisisRiskLevel = (anxietyLevel: number, hasCrisisKeywords: boolean): 'low' | 'moderate' | 'high' | 'critical' => {
  if (hasCrisisKeywords) {
    return 'critical';
  }
  if (anxietyLevel >= 8) {
    return 'high';
  } else if (anxietyLevel >= 6) {
    return 'moderate';
  }
  return 'low';
};
