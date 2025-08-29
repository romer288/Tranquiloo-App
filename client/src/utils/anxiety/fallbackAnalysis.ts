
import { FallbackAnxietyAnalysis } from './types';
import { KEYWORDS, detectTriggers, detectCognitiveDistortions } from './keywordDetection';
import { generatePersonalizedResponse } from './responseGenerator';
import { 
  generateRecommendedInterventions, 
  generateBeckAnxietyCategories, 
  generateDsm5Indicators, 
  determineTherapyApproach,
  determineCrisisRiskLevel 
} from './analysisUtils';

export const analyzeFallbackAnxiety = (
  message: string,
  conversationHistory: string[]
): FallbackAnxietyAnalysis => {
  const lowerMessage = message.toLowerCase().trim();
  
  console.log('🔍 FALLBACK: Analyzing message:', message);
  console.log('📝 FALLBACK: Message lowercase:', lowerMessage);
  
  let anxietyLevel = 1;
  let gad7Score = 0;
  let emotions: string[] = [];
  let crisisRiskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  let sentiment: 'positive' | 'neutral' | 'negative' | 'crisis' = 'neutral';
  
  // PRIORITY 1: Check for explicit "NOT anxious" or "I'm okay" statements
  const notAnxiousIndicators = [
    'not anxious', 'not worried', 'not scared', 'not nervous',
    'i am okay', "i'm okay", 'i am fine', "i'm fine",
    'feeling better', 'feeling good', 'feeling okay',
    'no anxiety', 'not feeling anxious'
  ];
  
  const isExplicitlyNotAnxious = notAnxiousIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  if (isExplicitlyNotAnxious) {
    console.log('✅ FALLBACK: Detected EXPLICIT "NOT anxious" or "okay" message');
    anxietyLevel = 1;
    gad7Score = 0;
    sentiment = 'positive';
    emotions.push('calm', 'okay');
    
  } else if (KEYWORDS.hallucinationKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // PRIORITY 2: Check for hallucination/psychotic symptoms
    console.log('🧠 FALLBACK: Detected HALLUCINATION/PSYCHOTIC symptoms');
    crisisRiskLevel = 'high';
    anxietyLevel = 8;
    gad7Score = 15;
    sentiment = 'crisis';
    emotions.push('confusion', 'distress', 'fear');
    
  } else if (KEYWORDS.crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // PRIORITY 3: Check for crisis indicators
    console.log('🚨 FALLBACK: Detected CRISIS message');
    crisisRiskLevel = 'critical';
    anxietyLevel = 9;
    gad7Score = 18;
    sentiment = 'crisis';
    emotions.push('despair', 'hopelessness');
    
  } else if (KEYWORDS.anxietyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // PRIORITY 3: Check for anxiety indicators
    console.log('😰 FALLBACK: Detected ANXIETY message');
    anxietyLevel = 6;
    gad7Score = 10;
    emotions.push('anxiety');
    sentiment = 'negative';
    
  } else if (KEYWORDS.depressionKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // PRIORITY 4: Check for depression indicators
    console.log('😢 FALLBACK: Detected DEPRESSION message');
    anxietyLevel = 4;
    gad7Score = 6;
    emotions.push('sadness');
    sentiment = 'negative';
    
  } else if (KEYWORDS.positiveKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // PRIORITY 5: Check for positive indicators
    console.log('😊 FALLBACK: Detected POSITIVE message');
    anxietyLevel = 1;
    gad7Score = 0;
    sentiment = 'positive';
    emotions.push('positive');
    
  } else {
    // PRIORITY 6: Default neutral
    console.log('😐 FALLBACK: Detected NEUTRAL message');
    anxietyLevel = 2;
    gad7Score = 2;
    sentiment = 'neutral';
    emotions.push('neutral');
  }
  
  const triggers = detectTriggers(lowerMessage);
  const cognitiveDistortions = detectCognitiveDistortions(lowerMessage);
  const hasCrisisKeywords = KEYWORDS.crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasHallucinationKeywords = KEYWORDS.hallucinationKeywords.some(keyword => lowerMessage.includes(keyword));
  
  crisisRiskLevel = determineCrisisRiskLevel(anxietyLevel, hasCrisisKeywords || hasHallucinationKeywords);
  const therapyApproach = determineTherapyApproach(cognitiveDistortions, crisisRiskLevel, emotions, triggers);
  
  const analysis = {
    anxietyLevel,
    gad7Score,
    triggers,
    emotions,
    cognitiveDistortions,
    crisisRiskLevel,
    sentiment,
    therapyApproach
  };
  
  console.log('📊 FALLBACK: Final analysis:', analysis);
  
  const recommendedInterventions = generateRecommendedInterventions(crisisRiskLevel);
  const beckAnxietyCategories = generateBeckAnxietyCategories(emotions, lowerMessage);
  const dsm5Indicators = generateDsm5Indicators(anxietyLevel, triggers);
  const personalizedResponse = generatePersonalizedResponse(message, analysis);
  
  console.log('📝 FALLBACK: Generated response:', personalizedResponse);
  
  return {
    anxietyLevel,
    gad7Score,
    beckAnxietyCategories,
    dsm5Indicators,
    triggers,
    emotions,
    cognitiveDistortions,
    recommendedInterventions,
    therapyApproach,
    crisisRiskLevel,
    sentiment,
    escalationDetected: anxietyLevel > 7,
    personalizedResponse
  };
};
