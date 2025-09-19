import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Check, X } from 'lucide-react';
import MobileSpeechButton from './MobileSpeechButton';

interface ChatMessageProps {
  message: Message;
  onEditMessage?: (messageId: string, newText: string) => void;
  currentLanguage?: 'en' | 'es';
}

const ChatMessage = ({ message, onEditMessage, currentLanguage = 'en' }: ChatMessageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyling = () => {
    if (message.sender === 'user') {
      return 'bg-blue-600 text-white';
    } else if (message.sender === 'monica') {
      return 'bg-pink-100 text-pink-900 border border-pink-200';
    } else {
      return 'bg-gray-100 text-gray-900';
    }
  };

  const getTimeStyling = () => {
    if (message.sender === 'user') {
      return 'text-blue-100';
    } else if (message.sender === 'monica') {
      return 'text-pink-600';
    } else {
      return 'text-gray-500';
    }
  };

  const handleSaveEdit = () => {
    if (onEditMessage && editText.trim() !== message.text) {
      onEditMessage(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const canEdit = message.sender === 'user' && onEditMessage;
  const canSpeak = message.sender !== 'user';

  if (isEditing) {
    return (
      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyling()}`}>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="text-sm mb-2 bg-white text-gray-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <div className="flex gap-1 justify-end">
            <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="p-1 h-6 w-6">
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="p-1 h-6 w-6">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyling()} relative`}>
        <p className="text-sm">{message.text}</p>
        <div className="flex items-center justify-between">
          <p className={`text-xs mt-1 ${getTimeStyling()}`}>
            {formatTime(message.timestamp)}
          </p>
          <div className="flex items-center gap-1">
            {canSpeak && (
              <MobileSpeechButton 
                text={message.text}
                language={currentLanguage}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-1"
              />
            )}
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 h-6 w-6 ml-1 touch-manipulation"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;