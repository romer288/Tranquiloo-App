
import { AnalysisKeywords } from './types';

export const KEYWORDS: AnalysisKeywords = {
  anxietyKeywords: ['anxious', 'worried', 'scared', 'panic', 'stress', 'nervous', 'fear'],
  depressionKeywords: ['sad', 'depressed', 'hopeless', 'tired', 'empty', 'worthless'],
  crisisKeywords: ['hurt myself', 'end it', 'suicide', 'kill myself', 'die', 'not worth living', 'want to commit suicide'],
  hallucinationKeywords: ['seeing things', 'hearing voices', 'talking animals', 'dog taking', 'dogs are talking', 'dogs talking', 'cats talking', 'animals talking', 'not real', "aren't real", 'seeing things that', 'hearing things that', 'voices in my head', 'hallucination', 'hallucinating', 'things moving', 'things that others', 'paranoid', 'watching me', 'following me', 'delusion', 'people talking', 'objects talking', 'hearing things'],
  positiveKeywords: ['okay', 'good', 'better', 'fine', 'great', 'happy', 'calm', 'peaceful', 'not anxious', 'not worried'],
  negativeKeywords: ['not anxious', 'not worried', 'not scared', "i'm okay", "i am okay", 'feeling better', 'feeling good']
};

// Enhanced trigger mapping for better categorization
const triggerMappings = {
  // Driving-related triggers
  'driving_anxiety': ['driving', 'drive', 'car', 'vehicle', 'intersection', 'traffic', 'road', 'highway', 'freeway', 'lane', 'parking', 'crash', 'accident', 'collision'],
  'work': ['work', 'job', 'office', 'boss', 'colleague', 'career', 'workplace', 'employment', 'meeting', 'deadline'],
  'social': ['social', 'people', 'friends', 'party', 'gathering', 'conversation', 'public', 'crowd', 'speaking', 'presentation'],
  'health': ['health', 'sick', 'pain', 'doctor', 'hospital', 'illness', 'disease', 'symptom', 'medical', 'therapy'],
  'financial': ['money', 'financial', 'debt', 'bills', 'budget', 'income', 'expenses', 'payment', 'loan', 'mortgage'],
  'relationships': ['relationship', 'partner', 'spouse', 'divorce', 'breakup', 'dating', 'marriage', 'family', 'conflict'],
  'performance': ['test', 'exam', 'performance', 'evaluation', 'assessment', 'interview', 'competition', 'failure', 'success'],
  'future_uncertainty': ['future', 'unknown', 'uncertain', 'change', 'decision', 'choice', 'plan', 'tomorrow', 'later'],
};

export const detectTriggers = (lowerMessage: string): string[] => {
  const triggers: string[] = [];
  
  // Check each trigger category against the message
  Object.entries(triggerMappings).forEach(([triggerType, keywords]) => {
    const hasMatch = keywords.some(keyword => lowerMessage.includes(keyword));
    if (hasMatch) {
      triggers.push(triggerType);
    }
  });
  
  return triggers;
};

export const detectCognitiveDistortions = (lowerMessage: string): string[] => {
  const distortions: string[] = [];
  
  if (lowerMessage.includes('always') || lowerMessage.includes('never') || lowerMessage.includes('everything')) {
    distortions.push('All-or-nothing thinking');
  }
  if (lowerMessage.includes('should') || lowerMessage.includes('must') || lowerMessage.includes('have to')) {
    distortions.push('Should statements');
  }
  if (lowerMessage.includes('worst') || lowerMessage.includes('terrible') || lowerMessage.includes('awful')) {
    distortions.push('Catastrophizing');
  }
  
  return distortions;
};
