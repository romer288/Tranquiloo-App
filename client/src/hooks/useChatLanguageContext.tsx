
import { useState, useCallback, useRef } from 'react';
import { detectLanguage, validateLanguageConsistency } from '@/utils/languageDetection';
import { Language } from '@/types/chat';

interface LanguageContext {
  currentLanguage: Language;
  lastSpokenLanguage: Language;
  conversationLanguage: Language;
  languageHistory: Language[];
}

export const useChatLanguageContext = () => {
  const [languageContext, setLanguageContext] = useState<LanguageContext>({
    currentLanguage: 'en',
    lastSpokenLanguage: 'en',
    conversationLanguage: 'en',
    languageHistory: ['en']
  });

  const speechInProgressRef = useRef<boolean>(false);

  const updateLanguageContext = useCallback((text: string, isUserInput: boolean = false) => {
    console.log('Updating language context for text:', text.substring(0, 50) + '...');
    
    // If speech is in progress, wait for it to finish before switching
    if (speechInProgressRef.current && !isUserInput) {
      console.log('Speech in progress, delaying language update');
      return languageContext.currentLanguage;
    }

    const detectedLanguage = isUserInput 
      ? detectLanguage(text)
      : validateLanguageConsistency(languageContext.conversationLanguage, text);

    setLanguageContext(prev => {
      const newContext = {
        ...prev,
        currentLanguage: detectedLanguage,
        languageHistory: [...prev.languageHistory.slice(-4), detectedLanguage] // Keep last 5 languages
      };

      // Update conversation language if there's a clear pattern
      const recentLanguages = newContext.languageHistory.slice(-3);
      const spanishCount = recentLanguages.filter(lang => lang === 'es').length;
      const englishCount = recentLanguages.filter(lang => lang === 'en').length;

      if (spanishCount >= 2) {
        newContext.conversationLanguage = 'es';
      } else if (englishCount >= 2) {
        newContext.conversationLanguage = 'en';
      }

      console.log('Updated language context:', newContext);
      return newContext;
    });

    return detectedLanguage;
  }, [languageContext]);

  const setSpeechInProgress = useCallback((inProgress: boolean) => {
    console.log('Speech in progress:', inProgress);
    speechInProgressRef.current = inProgress;
    
    if (!inProgress) {
      // Update last spoken language when speech ends
      setLanguageContext(prev => ({
        ...prev,
        lastSpokenLanguage: prev.currentLanguage
      }));
    }
  }, []);

  const forceLanguageSwitch = useCallback((language: Language) => {
    console.log('Forcing language switch to:', language);
    setLanguageContext(prev => ({
      ...prev,
      currentLanguage: language,
      conversationLanguage: language,
      languageHistory: [...prev.languageHistory, language]
    }));
  }, []);

  const resetLanguageContext = useCallback(() => {
    console.log('Resetting language context');
    setLanguageContext({
      currentLanguage: 'en',
      lastSpokenLanguage: 'en',
      conversationLanguage: 'en',
      languageHistory: ['en']
    });
  }, []);

  return {
    languageContext,
    updateLanguageContext,
    setSpeechInProgress,
    forceLanguageSwitch,
    resetLanguageContext
  };
};
