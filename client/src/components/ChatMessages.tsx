
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import { Message, AICompanion } from '@/types/chat';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  isAnalyzing: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  aiCompanion: AICompanion;
  onEditMessage?: (messageId: string, newText: string) => void;
  currentLanguage?: 'en' | 'es';
}

const ChatMessages = ({ 
  messages, 
  isTyping, 
  isAnalyzing, 
  scrollRef, 
  aiCompanion,
  onEditMessage,
  currentLanguage = 'en'
}: ChatMessagesProps) => {
  const getTypingMessage = () => {
    if (aiCompanion === 'monica') {
      return isAnalyzing ? 'Analizando tu mensaje...' : 'Mónica está escribiendo...';
    }
    return isAnalyzing ? 'Analyzing your message...' : 'Vanessa is typing...';
  };

  return (
    <ScrollArea className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4" ref={scrollRef}>
      <div className="space-y-4">
        {(messages ?? []).map((message) => (
          <ChatMessage key={message.id} message={message} onEditMessage={onEditMessage} currentLanguage={currentLanguage} />
        ))}
        {(isTyping || isAnalyzing) && (
          <div className="flex justify-start">
            <div className={`px-4 py-2 rounded-lg ${
              aiCompanion === 'monica' 
                ? 'bg-pink-100 text-pink-900' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  aiCompanion === 'monica' ? 'bg-pink-400' : 'bg-gray-400'
                }`}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  aiCompanion === 'monica' ? 'bg-pink-400' : 'bg-gray-400'
                }`} style={{ animationDelay: '0.1s' }}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  aiCompanion === 'monica' ? 'bg-pink-400' : 'bg-gray-400'
                }`} style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className={`text-xs mt-1 ${
                aiCompanion === 'monica' ? 'text-pink-600' : 'text-gray-500'
              }`}>
                {getTypingMessage()}
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
