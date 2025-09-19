
import { useAnxietyAnalysis } from '@/hooks/useAnxietyAnalysis';
import { chatService, ChatSession } from '@/services/chatService';

export const useChatAnalysis = () => {
  const { isAnalyzing, analyzeMessage } = useAnxietyAnalysis();

  const processMessageAnalysis = async (
    messageText: string,
    conversationHistory: string[],
    session: ChatSession
  ) => {
    try {
      const anxietyAnalysis = await analyzeMessage(messageText, conversationHistory);
      
      // Save the user message first
      const savedMessage = await chatService.saveMessage(session.id, messageText, 'user');
      
      // Save anxiety analysis to database
      await chatService.saveAnxietyAnalysis(savedMessage.id, anxietyAnalysis);
      
      return { anxietyAnalysis, savedMessage };
    } catch (error) {
      console.error('Failed to process analysis:', error);
      throw error;
    }
  };

  return {
    isAnalyzing,
    processMessageAnalysis
  };
};
