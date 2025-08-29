
import React from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useChatLanguageContext } from '@/hooks/useChatLanguageContext';
import { Language } from '@/types/chat';

export const useSpeechManagement = (currentLanguage: Language) => {
  const { isListening, speechSupported, startListening, autoStartListening } = useSpeechRecognition();
  const { speechSynthesisSupported, isSpeaking, speakText, stopSpeaking } = useSpeechSynthesis();
  const { languageContext, updateLanguageContext, setSpeechInProgress } = useChatLanguageContext();

  return {
    isListening,
    speechSupported,
    speechSynthesisSupported,
    isSpeaking,
    languageContext,
    startListening,
    autoStartListening,
    speakText,
    stopSpeaking,
    updateLanguageContext,
    setSpeechInProgress
  };
};
