import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useVoiceSelection, Lang } from '@/hooks/speech/useVoiceSelection';

interface MobileSpeechButtonProps {
  text: string;
  language: Lang;
  className?: string;
}

const MobileSpeechButton: React.FC<MobileSpeechButtonProps> = ({ text, language, className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { findBestVoiceForLanguage } = useVoiceSelection();

  const handleSpeak = () => {
    if (!text || isSpeaking || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      setIsSpeaking(true);
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      const v = findBestVoiceForLanguage(language);
      if (v) u.voice = v;
      u.lang = language === 'es' ? 'es-ES' : 'en-US';
      u.rate = 0.88;
      u.pitch = 1.0;
      u.volume = 1.0;

      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);

      setTimeout(() => window.speechSynthesis.speak(u), 80);
    } catch (e) {
      console.error('Mobile speech error:', e);
      setIsSpeaking(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-2 rounded-md transition-colors ${
        isSpeaking 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      aria-label="Play message"
    >
      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
    </button>
  );
};

export default MobileSpeechButton;