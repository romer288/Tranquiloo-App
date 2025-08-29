import { useEffect, useState, useRef } from 'react';
import { useChatSession } from '@/hooks/useChatSession';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatAnalysis } from '@/hooks/useChatAnalysis';
import { chatService, ChatSession } from '@/services/chatService';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { 
  createUserMessage, 
  createAIMessage, 
  getConversationHistory, 
  getFallbackResponse, 
  getContextualResponse,
  shouldSwitchToMonica 
} from '@/utils/chatUtils';

export const useChat = (sessionId?: string | null) => {
  const { user } = useAuth();
  const {
    currentSession,
    aiCompanion,
    currentLanguage,
    switchToMonica,
    setCurrentSession
  } = useChatSession();

  const {
    messages,
    inputText,
    setInputText,
    isTyping,
    setIsTyping,
    scrollRef,
    addWelcomeMessage,
    addMessage,
    updateMessage,
    editMessage,
    setMessages
  } = useChatMessages();

  const { isAnalyzing, processMessageAnalysis } = useChatAnalysis();
  
  // Message processing queue to prevent glitches with rapid messages
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const messageQueueRef = useRef<string[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Load messages when session ID is provided
  const { data: sessionMessages } = useQuery({
    queryKey: [`/api/chat-sessions/${sessionId}/messages`],
    enabled: !!sessionId,
    staleTime: 0, // Always fetch fresh data when session changes
  });

  // Load session details when session ID is provided
  const { data: sessionDetails } = useQuery({
    queryKey: [`/api/chat-sessions/${sessionId}`],
    enabled: !!sessionId,
    staleTime: 0,
  });

  // Load messages from existing session
  useEffect(() => {
    if (sessionId && sessionMessages && sessionDetails && Array.isArray(sessionMessages)) {
      setIsLoadingSession(true);
      console.log('Loading session messages:', sessionMessages.length, 'messages');
      
      // Convert API messages to chat format
      const loadedMessages = sessionMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender === 'user' ? 'user' : (sessionDetails as any).companionType || 'vanessa',
        timestamp: new Date(msg.createdAt),
        anxietyAnalysis: msg.anxietyAnalysis
      }));
      
      setMessages(loadedMessages);
      setCurrentSession(sessionDetails as ChatSession);
      setIsLoadingSession(false);
    }
  }, [sessionId, sessionMessages, sessionDetails, setMessages, setCurrentSession]);

  // Initialize welcome message when session is created (only if not loading existing session)
  useEffect(() => {
    if (currentSession && messages.length === 0 && !sessionId && !isLoadingSession) {
      const welcomeMessage = addWelcomeMessage(aiCompanion);
      
      // Save welcome message to database with userId
      const userId = (user as any)?.id || 'anonymous';
      chatService.sendMessage(currentSession.id, welcomeMessage.text, 'assistant', userId)
        .catch((error: any) => console.error('Failed to save welcome message:', error));
    }
  }, [currentSession, aiCompanion, sessionId, isLoadingSession]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || !currentSession || isProcessingMessage) return;

    // Add to queue if already processing
    if (isProcessingMessage) {
      messageQueueRef.current.push(textToSend);
      setInputText('');
      return;
    }

    console.log('📤 Sending message:', textToSend);

    // Check if we should switch to Monica
    if (shouldSwitchToMonica(textToSend, aiCompanion)) {
      const monicaSession = await switchToMonica();
      if (monicaSession) {
        const monicaIntroMessage = createAIMessage(
          "¡Hola! Soy Mónica, tu compañera de apoyo para la ansiedad. Estoy aquí para brindarte apoyo clínico informado usando los enfoques terapéuticos más avanzados. ¿Cómo te sientes hoy?",
          'monica'
        );
        
        addMessage(monicaIntroMessage);
        const userId = (user as any)?.id || 'anonymous';
        await chatService.sendMessage(monicaSession.id, monicaIntroMessage.text, 'assistant', userId);
      }
      setInputText('');
      return;
    }

    setIsProcessingMessage(true);
    
    try {
      const conversationHistory = getConversationHistory(messages);
      const userMessage = createUserMessage(textToSend);
      
      addMessage(userMessage);
      setInputText('');
      setIsTyping(true);

      // Save user message to database with userId
      const userId = (user as any)?.id || 'anonymous';
      chatService.sendMessage(currentSession.id, textToSend, 'user', userId)
        .catch((error: any) => console.error('Failed to save user message:', error));

      // Process analysis and save message
      const { anxietyAnalysis } = await processMessageAnalysis(
        textToSend, 
        conversationHistory, 
        currentSession
      );

      const source = (anxietyAnalysis as any).source || 'unknown';
      console.log(`🧠 Analysis complete from ${source.toUpperCase()}:`, anxietyAnalysis);

      // Update user message with analysis
      updateMessage(userMessage.id, { anxietyAnalysis });

      // Generate AI response
      setTimeout(async () => {
        const contextualResponse = getContextualResponse(anxietyAnalysis, currentLanguage);
        console.log(`🗣️ Using response from ${source.toUpperCase()}:`, contextualResponse);
        
        const aiMessage = createAIMessage(contextualResponse, aiCompanion);
        addMessage(aiMessage);
        setIsTyping(false);

        // Save AI response to database with userId
        const userId = (user as any)?.id || 'anonymous';
        await chatService.sendMessage(currentSession.id, contextualResponse, 'assistant', userId);
      }, 800);

    } catch (error) {
      console.error('💥 Error in message handling:', error);
      setIsTyping(false);
      
      const fallbackMessage = createAIMessage(
        getFallbackResponse(currentLanguage, aiCompanion),
        aiCompanion
      );
      
      addMessage(fallbackMessage);

      // Save fallback message to database
      if (currentSession) {
        try {
          const userId = (user as any)?.id || 'anonymous';
          await chatService.sendMessage(currentSession.id, fallbackMessage.text, 'assistant', userId);
        } catch (saveError) {
          console.error('Failed to save fallback message:', saveError);
        }
      }
    } finally {
      setIsProcessingMessage(false);
      
      // Process next message in queue
      if (messageQueueRef.current.length > 0) {
        const nextMessage = messageQueueRef.current.shift();
        if (nextMessage) {
          setTimeout(() => handleSendMessage(nextMessage), 100);
        }
      }
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    isAnalyzing,
    currentLanguage,
    aiCompanion,
    scrollRef,
    handleSendMessage,
    editMessage
  };
};