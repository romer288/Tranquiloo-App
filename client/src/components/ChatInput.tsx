
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, AlertTriangle, Volume2, VolumeX, Languages } from 'lucide-react';
import { Language } from '@/types/chat';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isListening: boolean;
  speechSupported: boolean;
  onToggleListening: () => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  currentLanguage: Language;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
  onShowCrisisResources?: () => void;
  autoSpeak?: boolean;
  onToggleAutoSpeak?: () => void;
  onUserGesture?: () => void;
  onLanguageChange?: (lang: Language) => void;
  aiCompanion?: 'vanessa' | 'monica';
}

const ChatInput = ({
  inputText,
  setInputText,
  isListening,
  speechSupported,
  onToggleListening,
  onSendMessage,
  onKeyPress,
  currentLanguage,
  onStopSpeaking,
  isSpeaking,
  onShowCrisisResources,
  autoSpeak = true,
  onToggleAutoSpeak,
  onUserGesture,
  onLanguageChange,
  aiCompanion = 'vanessa'
}: ChatInputProps) => {
  const getPlaceholder = () => {
    if (currentLanguage === 'es' || aiCompanion === 'monica') {
      return isListening 
        ? "Escuchando..." 
        : speechSupported 
          ? "Escribe o habla tu mensaje..." 
          : "Escribe tu mensaje...";
    }
    return isListening 
      ? "Listening..." 
      : speechSupported 
        ? "Type or speak your message..." 
        : "Type your message...";
  };

  const getVoiceButtonTitle = () => {
    if (currentLanguage === 'es' || aiCompanion === 'monica') {
      return speechSupported ? "Entrada de voz" : "Entrada de voz no compatible";
    }
    return speechSupported ? "Voice input" : "Voice input not supported";
  };

  const getListeningText = () => {
    if (currentLanguage === 'es' || aiCompanion === 'monica') {
      return "Escuchando tu voz...";
    }
    return "Listening for your voice...";
  };

  const handleSendClick = () => {
    onUserGesture?.(); // Unlock speech on send
    console.log('Send button clicked, inputText:', inputText);
    if (inputText.trim()) {
      onSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Auto-speak toggle and Language selector */}
      {(onToggleAutoSpeak || onLanguageChange) && (
        <div className="flex items-center justify-between mb-2">
          {/* Language selector */}
          {onLanguageChange && (
            <button
              onClick={() => onLanguageChange(currentLanguage === 'en' ? 'es' : 'en')}
              className="flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
              title="Switch language"
            >
              <Languages className="w-4 h-4" />
              <span>{currentLanguage === 'es' || aiCompanion === 'monica' ? 'Español' : 'English'}</span>
            </button>
          )}
          {onToggleAutoSpeak && (
          <button
            onClick={onToggleAutoSpeak}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
              autoSpeak
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={autoSpeak ? 'AI voice is ON - Click to turn OFF' : 'AI voice is OFF - Click to turn ON'}
          >
            {autoSpeak ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Voice OFF</span>
              </>
            )}
          </button>
          )}
        </div>
      )}
      <div className="flex space-x-2">
        <Button
          onClick={() => {
            onUserGesture?.(); // Unlock speech on mic toggle
            onToggleListening();
          }}
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          className="shrink-0"
          disabled={!speechSupported}
          title={getVoiceButtonTitle()}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            onUserGesture?.(); // Unlock speech on first keystroke
            console.log('📝 Input change:', e.target.value);

            // Stop speech when user starts typing
            if (isSpeaking && onStopSpeaking) {
              console.log('🔊 Stopping speech due to typing');
              onStopSpeaking();
            }
            // Turn off mic when typing
            if (isListening) {
              console.log('🎤 Stopping listening due to typing');
              onToggleListening();
            }
            setInputText(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="flex-1 h-10 px-3 py-2 text-base md:text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          enterKeyHint="send"
        />
        {onShowCrisisResources && (
          <Button
            onClick={onShowCrisisResources}
            variant="outline"
            size="icon"
            className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Crisis Resources - 24/7 Help Available"
            type="button"
          >
            <AlertTriangle className="w-4 h-4" />
          </Button>
        )}
        <Button
          onClick={handleSendClick}
          disabled={!inputText.trim()}
          size="icon"
          className="shrink-0"
          type="button"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {isListening && (
        <p className={`text-sm mt-2 flex items-center gap-1 pe-none ${
          currentLanguage === 'es' || aiCompanion === 'monica' ? 'text-pink-600' : 'text-blue-600'
        }`}>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {getListeningText()}
        </p>
      )}
    </div>
  );
};

export default ChatInput;
