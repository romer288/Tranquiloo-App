
import React from 'react';
import { Language } from '@/types/chat';
import { useSpeechManagement } from '@/hooks/chat/useSpeechManagement';
import { useInteractionHandlers } from '@/hooks/chat/useInteractionHandlers';

export const useChatInteractions = (
  currentLanguage: Language,
  setInputText: (text: string) => void,
  handleSendMessage: () => void
) => {
  const speechManagement = useSpeechManagement(currentLanguage);
  
  const interactionHandlers = useInteractionHandlers({
    ...speechManagement,
    currentLanguage,
    setInputText,
    handleSendMessage
  });

  return {
    isListening: speechManagement.isListening,
    speechSupported: speechManagement.speechSupported,
    speechSynthesisSupported: speechManagement.speechSynthesisSupported,
    languageContext: speechManagement.languageContext,
    isSpeaking: speechManagement.isSpeaking,
    handleToggleListening: interactionHandlers.handleToggleListening,
    handleKeyPress: interactionHandlers.handleKeyPress,
    handleAutoStartListening: interactionHandlers.handleAutoStartListening,
    handleSpeakText: interactionHandlers.handleSpeakText,
    stopSpeaking: interactionHandlers.stopSpeaking
  };
};
