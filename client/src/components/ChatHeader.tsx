
import React from 'react';
import { Volume2, VolumeX, ChevronLeft, History } from 'lucide-react';
import { AICompanion, Language } from '@/types/chat';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  speechSynthesisSupported: boolean;
  speechSupported: boolean;
  aiCompanion: AICompanion;
  currentLanguage: Language;
  onToggleMobileChatHistory?: () => void;
}

const ChatHeader = ({
  speechSynthesisSupported,
  speechSupported,
  aiCompanion,
  currentLanguage,
  onToggleMobileChatHistory
}: ChatHeaderProps) => {
  const getTitle = () => {
    if (aiCompanion === 'monica') {
      return 'Apoyo Avanzado para la Ansiedad con Mónica';
    }
    return 'Advanced Anxiety Support with Vanessa';
  };

  const getSubtitle = () => {
    if (aiCompanion === 'monica') {
      return 'Compañera IA con análisis clínico y soporte de voz';
    }
    return 'AI companion with clinical analysis and voice support';
  };

  const getWarningMessage = () => {
    if (aiCompanion === 'monica') {
      return 'Las funciones de voz no están disponibles en este navegador. Aún puedes chatear escribiendo.';
    }
    return 'Voice features not available in this browser. You can still chat by typing.';
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-2 md:hidden">
          <Link
            to="/dashboard"
            className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation inline-block"
            aria-label="Back to dashboard"
            data-testid="back-to-dashboard"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>

          {onToggleMobileChatHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleMobileChatHistory}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {speechSynthesisSupported ? (
            <Volume2 className="w-6 h-6 text-green-600" />
          ) : (
            <VolumeX className="w-6 h-6 text-gray-400" />
          )}
          {getTitle()}
          {aiCompanion === 'monica' && (
            <span className="text-sm bg-pink-100 text-pink-800 px-2 py-1 rounded-full ml-2">
              Español
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          {getSubtitle()}
        </p>
        {!speechSupported && !speechSynthesisSupported && (
          <p className="text-amber-600 text-sm mt-2">
            {getWarningMessage()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
