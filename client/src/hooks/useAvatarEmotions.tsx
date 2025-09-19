
import React from 'react';
import { useAvatarAnimation } from '@/hooks/useAvatarAnimation';
import { ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';
import { FallbackAnxietyAnalysis } from '@/utils/anxiety/types';
import { Message, AICompanion } from '@/types/chat';

// Create a unified type for anxiety analysis
type AnxietyAnalysis = ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis;

export const useAvatarEmotions = (
  aiCompanion: AICompanion,
  messages: Message[],
  isTyping: boolean,
  anxietyAnalyses: AnxietyAnalysis[],
  currentAnxietyAnalysis: AnxietyAnalysis | null
) => {
  const {
    isAnimating,
    currentEmotion,
    startAnimation,
    stopAnimation,
    updateEmotionFromAnxietyAnalysis
  } = useAvatarAnimation(aiCompanion);

  // Get the most recent anxiety analysis
  const getLatestAnxietyAnalysis = React.useCallback((): AnxietyAnalysis | null => {
    const userMessagesWithAnalysis = messages
      .filter(msg => msg.sender === 'user' && msg.anxietyAnalysis)
      .reverse();
    
    return userMessagesWithAnalysis.length > 0 
      ? userMessagesWithAnalysis[0].anxietyAnalysis as AnxietyAnalysis
      : currentAnxietyAnalysis;
  }, [messages, currentAnxietyAnalysis]);

  // Get all anxiety analyses from messages
  const getAllAnalyses = React.useCallback((): AnxietyAnalysis[] => {
    const messageAnalyses = messages
      .filter(msg => msg.sender === 'user' && msg.anxietyAnalysis)
      .map(msg => msg.anxietyAnalysis as AnxietyAnalysis);
    
    // Combine and deduplicate
    const allAnalyses = [...messageAnalyses, ...anxietyAnalyses]
      .filter((analysis, index, arr) => 
        arr.findIndex(a => JSON.stringify(a) === JSON.stringify(analysis)) === index
      ) as AnxietyAnalysis[];

    return allAnalyses;
  }, [messages, anxietyAnalyses]);

  const latestAnalysis = getLatestAnxietyAnalysis();
  const allAnalyses = getAllAnalyses();

  // Update avatar emotion based on latest analysis
  React.useEffect(() => {
    if (latestAnalysis) {
      updateEmotionFromAnxietyAnalysis(latestAnalysis);
    }
  }, [latestAnalysis, updateEmotionFromAnxietyAnalysis]);

  // Handle avatar animation when AI is speaking
  React.useEffect(() => {
    if (isTyping) {
      // Get the last AI message to animate with
      const lastAiMessage = messages
        .filter(msg => msg.sender === aiCompanion)
        .slice(-1)[0];
      
      if (lastAiMessage) {
        startAnimation(lastAiMessage.text);
      }
    } else {
      stopAnimation();
    }
  }, [isTyping, messages, aiCompanion, startAnimation, stopAnimation]);

  return {
    isAnimating,
    currentEmotion,
    latestAnalysis,
    allAnalyses
  };
};
