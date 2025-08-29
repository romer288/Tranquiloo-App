
import { Message, AICompanion, Language } from '@/types/chat';
import { detectLanguage } from '@/utils/languageDetection';

export const createUserMessage = (text: string): Message => ({
  id: Date.now().toString(),
  text,
  sender: 'user',
  timestamp: new Date()
});

export const createAIMessage = (text: string, companion: AICompanion): Message => ({
  id: (Date.now() + 1).toString(),
  text,
  sender: companion,
  timestamp: new Date()
});

export const getConversationHistory = (messages: Message[]): string[] => {
  return messages
    .filter(msg => msg.sender === 'user')
    .map(msg => msg.text)
    .slice(-10);
};

export const getFallbackResponse = (language: Language, companion: AICompanion): string => {
  if (language === 'es') {
    return "Estoy aquí para escucharte y apoyarte. ¿Cómo puedo ayudarte mejor en este momento?";
  }
  return "I'm here to listen and support you. How can I best help you right now?";
};

export const getContextualResponse = (anxietyAnalysis: any, language: Language): string => {
  return anxietyAnalysis.personalizedResponse || 
    (language === 'es' 
      ? "Estoy aquí para apoyarte. ¿Cómo puedo ayudarte mejor en este momento?"
      : "I'm here to support you. How can I best help you right now?");
};

export const shouldSwitchToMonica = (text: string, currentCompanion: AICompanion): boolean => {
  const detectedLanguage = detectLanguage(text);
  return detectedLanguage === 'es' && currentCompanion === 'vanessa';
};
