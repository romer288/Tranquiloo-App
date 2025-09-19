
import { useState, useEffect } from 'react';
import { chatService, ChatSession } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AICompanion, Language } from '@/types/chat';

export const useChatSession = (existingSessionId?: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [aiCompanion, setAiCompanion] = useState<AICompanion>('vanessa');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    if (user) {
      if (existingSessionId) {
        // If we have a session ID, always load that specific session
        loadExistingSession(existingSessionId);
      } else if (!currentSession) {
        // Only create new session if we don't have one and no session ID provided
        initializeChat();
      }
    }
  }, [user, existingSessionId]);

  // Reset session when sessionId changes to null (new chat)
  useEffect(() => {
    if (existingSessionId === null && currentSession) {
      // User navigated to new chat, reset current session
      setCurrentSession(null);
    }
  }, [existingSessionId]);

  const loadExistingSession = async (sessionId: string) => {
    try {
      console.log('Loading existing session:', sessionId);

      // Fetch the existing session details
      const response = await fetch(`/api/chat-sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to load session');
      }

      const session = await response.json();
      setCurrentSession(session);

      // Set the companion type based on session data
      if (session.aiCompanion === 'monica') {
        setAiCompanion('monica');
        setCurrentLanguage('es');
      } else {
        setAiCompanion('vanessa');
        setCurrentLanguage('en');
      }

      console.log('Existing session loaded:', session);
    } catch (error) {
      console.error('Failed to load existing session:', error);
      // If loading fails, create a new session instead
      initializeChat();
    }
  };

  const initializeChat = async () => {
    try {
      if (!user?.id) {
        console.log('User ID not available for chat session creation');
        return;
      }

      // Create a NEW session for new conversations
      const session = await chatService.createChatSession(user.id, 'New Chat Session');
      setCurrentSession(session);
      console.log('New chat session created:', session);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const switchToMonica = async () => {
    if (aiCompanion === 'vanessa' && currentSession) {
      try {
        const monicaSession = await chatService.createChatSession(user?.id || '', 'Chat with Monica');
        setCurrentSession(monicaSession);
        setAiCompanion('monica');
        setCurrentLanguage('es');
        return monicaSession;
      } catch (error) {
        console.error('Failed to switch to Monica:', error);
        toast({
          title: "Error",
          description: "Failed to switch to Monica. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    }
    return null;
  };

  return {
    currentSession,
    setCurrentSession,
    aiCompanion,
    currentLanguage,
    setAiCompanion,
    setCurrentLanguage,
    switchToMonica
  };
};
