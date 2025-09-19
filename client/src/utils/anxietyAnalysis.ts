
export interface AnxietyAnalysis {
  level: number; // 1-10 scale
  triggers: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

export const analyzeAnxietyLevel = (message: string): AnxietyAnalysis => {
  const text = message.toLowerCase();
  
  // Anxiety keywords with different weights
  const highAnxietyKeywords = [
    'panic', 'terrified', 'overwhelmed', 'can\'t breathe', 'heart racing',
    'dying', 'losing control', 'going crazy', 'disaster', 'catastrophe'
  ];
  
  const mediumAnxietyKeywords = [
    'worried', 'anxious', 'stressed', 'nervous', 'scared', 'afraid',
    'concerned', 'uneasy', 'tense', 'restless', 'agitated'
  ];
  
  const lowAnxietyKeywords = [
    'uncertain', 'unsure', 'bothered', 'troubled', 'uncomfortable',
    'hesitant', 'cautious', 'apprehensive'
  ];
  
  const positiveKeywords = [
    'good', 'better', 'happy', 'calm', 'relaxed', 'peaceful',
    'confident', 'grateful', 'hopeful', 'improving'
  ];
  
  // Common anxiety triggers
  const triggerKeywords = {
    'work': ['work', 'job', 'boss', 'deadline', 'meeting', 'colleague'],
    'social': ['people', 'friends', 'family', 'social', 'party', 'crowd'],
    'health': ['health', 'sick', 'pain', 'doctor', 'hospital', 'symptoms'],
    'financial': ['money', 'bills', 'debt', 'financial', 'cost', 'expensive'],
    'future': ['future', 'tomorrow', 'next', 'plan', 'uncertain', 'unknown'],
    'relationships': ['relationship', 'partner', 'spouse', 'dating', 'breakup']
  };
  
  let anxietyScore = 0;
  let foundKeywords: string[] = [];
  let triggers: string[] = [];
  
  // Check for high anxiety indicators
  highAnxietyKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      anxietyScore += 3;
      foundKeywords.push(keyword);
    }
  });
  
  // Check for medium anxiety indicators
  mediumAnxietyKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      anxietyScore += 2;
      foundKeywords.push(keyword);
    }
  });
  
  // Check for low anxiety indicators
  lowAnxietyKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      anxietyScore += 1;
      foundKeywords.push(keyword);
    }
  });
  
  // Check for positive indicators (reduce anxiety score)
  positiveKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      anxietyScore = Math.max(0, anxietyScore - 1);
    }
  });
  
  // Check for triggers
  Object.entries(triggerKeywords).forEach(([trigger, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        triggers.push(trigger);
      }
    });
  });
  
  // Remove duplicates
  triggers = [...new Set(triggers)];
  
  // Determine anxiety level (1-10 scale)
  let level = Math.min(10, Math.max(1, anxietyScore + 1));
  
  // Determine sentiment
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (anxietyScore >= 4) sentiment = 'negative';
  else if (anxietyScore <= 1 && positiveKeywords.some(k => text.includes(k))) sentiment = 'positive';
  
  return {
    level,
    triggers,
    sentiment,
    keywords: foundKeywords
  };
};

export const getAnxietyLevelDescription = (level: number): string => {
  if (level <= 2) return 'Very Low';
  if (level <= 4) return 'Low';
  if (level <= 6) return 'Moderate';
  if (level <= 8) return 'High';
  return 'Very High';
};

export const getAnxietyColor = (level: number): string => {
  if (level <= 2) return 'text-green-600';
  if (level <= 4) return 'text-yellow-600';
  if (level <= 6) return 'text-orange-600';
  if (level <= 8) return 'text-red-600';
  return 'text-red-800';
};
