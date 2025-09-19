
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addWelcomeMessage = (companionName: 'vanessa' | 'monica') => {
    const welcomeMessage: Message = {
      id: '1',
      text: companionName === 'vanessa' 
        ? "Hello! I'm Vanessa, your advanced AI anxiety companion. I'm here to provide you with clinically-informed support using the latest therapeutic approaches. How are you feeling today?"
        : "¡Hola! Soy Mónica, tu compañera de apoyo para la ansiedad. Estoy aquí para brindarte apoyo clínico informado usando los enfoques terapéuticos más avanzados. ¿Cómo te sientes hoy?",
      sender: companionName,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    return welcomeMessage;
  };

  const addMessage = (message: Message) => {
    setMessages(prev => {
      // Check if message already exists to prevent frontend duplicates
      const exists = prev.find(msg => msg.id === message.id);
      if (exists) {
        console.log('🚫 Duplicate message blocked (same ID):', message.id, message.text);
        return prev;
      }

      // Also check for duplicate content from same sender within last few seconds
      const duplicateContent = prev.find(msg =>
        msg.text === message.text &&
        msg.sender === message.sender &&
        Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
      );

      if (duplicateContent) {
        console.log('🚫 Duplicate message blocked (same content):', message.text);
        return prev;
      }

      console.log('✅ Adding new message:', message.id, message.text.substring(0, 50));
      return [...prev, message];
    });
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, ...updates }
          : msg
      )
    );
  };

  const editMessage = (messageId: string, newText: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: newText }
          : msg
      )
    );
  };

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    isTyping,
    setIsTyping,
    scrollRef,
    addWelcomeMessage,
    addMessage,
    updateMessage,
    editMessage
  };
};
