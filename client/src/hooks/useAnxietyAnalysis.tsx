
import { useState, useEffect } from 'react';
import { analyzeAnxietyWithClaude, ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';
import { analyzeFallbackAnxiety } from '@/utils/anxiety/fallbackAnalysis';
import { FallbackAnxietyAnalysis } from '@/utils/anxiety/types';

export const useAnxietyAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [anxietyAnalyses, setAnxietyAnalyses] = useState<(ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis)[]>([]);
  const [currentAnxietyAnalysis, setCurrentAnxietyAnalysis] = useState<ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis | null>(null);

  // Load any persisted analyses for analytics graphs
  useEffect(() => {
    try {
      const stored = localStorage.getItem('anxietyAnalyses');
      if (stored) {
        setAnxietyAnalyses(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const analyzeMessage = async (
    message: string,
    conversationHistory: string[]
  ): Promise<ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis> => {
    setIsAnalyzing(true);

    try {
      let anxietyAnalysis: ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis;
      let usingClaude = false;

      try {
        console.log('🔍 Attempting Claude analysis for message:', message);
        console.log('📝 Conversation history:', conversationHistory);
        
        anxietyAnalysis = await analyzeAnxietyWithClaude(
          message,
          conversationHistory,
          'user-123'
        );
        
        // Check if this is actually a Claude response or fallback
        if (anxietyAnalysis.personalizedResponse && 
            anxietyAnalysis.personalizedResponse !== "I'm here to support you through this difficult time. Let's work together to help you feel better.") {
          usingClaude = true;
          console.log('✅ REAL Claude analysis successful:', anxietyAnalysis);
          console.log('💬 CLAUDE personalized response:', anxietyAnalysis.personalizedResponse);
        } else {
          console.log('⚠️ Claude API returned fallback response, treating as failed');
          throw new Error('Claude returned generic fallback');
        }
        
      } catch (error) {
        console.log('❌ Claude API failed, using LOCAL fallback analysis:', error);
        anxietyAnalysis = analyzeFallbackAnxiety(message, conversationHistory);
        console.log('🔄 LOCAL Fallback analysis completed:', anxietyAnalysis);
        console.log('💬 FALLBACK personalized response:', anxietyAnalysis.personalizedResponse);
      }

      // Add a flag to indicate the source
      (anxietyAnalysis as any).source = usingClaude ? 'claude' : 'fallback';

      setCurrentAnxietyAnalysis(anxietyAnalysis);
      setAnxietyAnalyses(prev => {
        const updated = [...prev, anxietyAnalysis];
        try { localStorage.setItem('anxietyAnalyses', JSON.stringify(updated)); } catch {}
        return updated;
      });

      return anxietyAnalysis;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    anxietyAnalyses,
    currentAnxietyAnalysis,
    analyzeMessage
  };
};
