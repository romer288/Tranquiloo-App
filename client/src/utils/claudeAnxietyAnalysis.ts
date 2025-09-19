
// Claude anxiety analysis utility - migrated to use new API endpoints

export interface ClaudeAnxietyAnalysis {
  anxietyLevel: number;
  gad7Score: number;
  beckAnxietyCategories: string[];
  dsm5Indicators: string[];
  triggers: string[];
  cognitiveDistortions: string[];
  recommendedInterventions: string[];
  therapyApproach: 'CBT' | 'DBT' | 'Mindfulness' | 'Trauma-Informed' | 'Supportive';
  crisisRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative' | 'crisis';
  escalationDetected: boolean;
  personalizedResponse: string;
}

interface ClaudeApiResponse {
  success: boolean;
  error?: string;
  analysis?: ClaudeAnxietyAnalysis;
}

export const analyzeAnxietyWithClaude = async (
  message: string,
  conversationHistory: string[] = [],
  userId?: string
): Promise<ClaudeAnxietyAnalysis> => {
  console.log('🔍 Starting Claude analysis for message:', message);
  console.log('📝 Conversation history:', conversationHistory);

  try {
    if (!userId) {
      throw new Error('User ID is required for anxiety analysis');
    }

    console.log('🌐 Calling new anxiety analysis API endpoint');
    
    const response = await fetch('/api/analyze-anxiety-claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();

    console.log('📡 Claude API response data:', data);

    if (!data) {
      console.log('❌ No data received from Claude API');
      throw new Error('No data received from Claude API');
    }

    // Check if it's an error response
    if (data.error) {
      console.log('❌ Claude API returned error:', data.error);
      throw new Error(`Claude API error: ${data.error}`);
    }

    // The server now returns the analysis directly, not wrapped in success/analysis
    // Convert server response to expected format
    const analysis: ClaudeAnxietyAnalysis = {
      anxietyLevel: data.anxietyLevel || 5,
      gad7Score: Math.max(0, Math.min(21, data.anxietyLevel * 2.1)), // Convert 1-10 to GAD-7 scale
      beckAnxietyCategories: data.triggers || [],
      dsm5Indicators: data.triggers || [],
      triggers: data.triggers || [],
      cognitiveDistortions: ['Catastrophizing', 'All-or-nothing thinking'],
      recommendedInterventions: data.copingStrategies || [],
      therapyApproach: data.anxietyLevel > 7 ? 'CBT' : 'Supportive',
      crisisRiskLevel: data.anxietyLevel > 8 ? 'high' : data.anxietyLevel > 6 ? 'moderate' : 'low',
      sentiment: data.anxietyLevel > 7 ? 'negative' : data.anxietyLevel > 4 ? 'neutral' : 'positive',
      escalationDetected: data.anxietyLevel > 8,
      personalizedResponse: data.personalizedResponse || 'I\'m here to support you through this.'
    };
    
    // Validate that we got a proper response
    if (!analysis.personalizedResponse || analysis.personalizedResponse.length < 10) {
      console.log('❌ Invalid or empty personalized response from Claude');
      throw new Error('Invalid response from Claude');
    }

    console.log('✅ REAL Claude analysis successful:', analysis);
    console.log('💬 CLAUDE personalized response:', analysis.personalizedResponse);
    
    return analysis;

  } catch (error) {
    console.log('❌ Claude API completely failed:', error);
    
    // Re-throw the error so the calling code knows to use fallback
    throw new Error('Claude API unavailable');
  }
};

export const getGAD7Description = (score: number): string => {
  if (score >= 15) return 'Severe';
  if (score >= 10) return 'Moderate';
  if (score >= 5) return 'Mild';
  return 'Minimal';
};

export const getCrisisRiskColor = (level: string): string => {
  switch (level) {
    case 'critical': return 'text-red-800';
    case 'high': return 'text-red-600';
    case 'moderate': return 'text-orange-600';
    default: return 'text-green-600';
  }
};

export const getTherapyApproachDescription = (approach: string): string => {
  switch (approach) {
    case 'CBT': return 'Cognitive Behavioral Therapy focuses on identifying and changing negative thought patterns';
    case 'DBT': return 'Dialectical Behavior Therapy helps with emotional regulation and distress tolerance';
    case 'Mindfulness': return 'Mindfulness-based approaches focus on present-moment awareness';
    case 'Trauma-Informed': return 'Trauma-informed care addresses the impact of traumatic experiences';
    default: return 'Supportive therapy provides emotional support and validation';
  }
};
