
import React from 'react';

interface SimpleFallbackAvatarProps {
  isAnimating: boolean;
  emotion: 'neutral' | 'empathetic' | 'concerned' | 'supportive';
  onStoppedSpeaking?: () => void;
}

export const SimpleFallbackAvatar: React.FC<SimpleFallbackAvatarProps> = ({ 
  isAnimating, 
  emotion,
  onStoppedSpeaking 
}) => {
  const getEmotionColor = () => {
    switch (emotion) {
      case 'empathetic': return '#A7C7E7';
      case 'concerned': return '#FFB6C1';
      case 'supportive': return '#98FB98';
      default: return '#FDBCB4';
    }
  };

  const getEmotionEmoji = () => {
    switch (emotion) {
      case 'empathetic': return '🤗';
      case 'concerned': return '😟';
      case 'supportive': return '😊';
      default: return '😐';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        {/* Avatar circle */}
        <div 
          className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
            isAnimating ? 'animate-pulse scale-110' : 'scale-100'
          }`}
          style={{ backgroundColor: getEmotionColor() }}
        >
          {getEmotionEmoji()}
        </div>
        
        {/* Breathing animation */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-white opacity-30 animate-ping"
          style={{ 
            animationDuration: isAnimating ? '1s' : '3s',
            animationDelay: '0.5s'
          }}
        />
        
        {/* Speaking indicator */}
        {isAnimating && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
