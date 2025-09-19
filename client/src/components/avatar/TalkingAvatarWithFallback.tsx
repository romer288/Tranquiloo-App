
import React, { useState, useEffect } from 'react';
import { TalkingAvatar } from './TalkingAvatar';
import useFPS from '@/hooks/useFPS';

interface TalkingAvatarWithFallbackProps {
  text: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  className?: string;
  avatarType?: 'default' | 'vanessa';
}

export const TalkingAvatarWithFallback: React.FC<TalkingAvatarWithFallbackProps> = ({
  text,
  onSpeechStart,
  onSpeechEnd,
  className = '',
  avatarType = 'default'
}) => {
  const [showFallback, setShowFallback] = useState(false);
  const { fps, isLowPerformance } = useFPS();

  useEffect(() => {
    if (fps < 25 || isLowPerformance) {
      console.log('Low performance detected, switching to audio-only mode');
      setShowFallback(true);
    }
  }, [fps, isLowPerformance]);

  if (showFallback) {
    const isVanessa = avatarType === 'vanessa';
    return (
      <div className={`${className} flex items-center justify-center ${
        isVanessa 
          ? 'bg-gradient-to-br from-pink-100 to-purple-100' 
          : 'bg-gray-100'
      } rounded-xl`}>
        <div className="text-center p-4">
          <div className={`w-16 h-16 ${
            isVanessa ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-blue-500'
          } rounded-full mx-auto mb-2 flex items-center justify-center`}>
            <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
          </div>
          <div className="text-xs text-gray-600">
            {isVanessa ? 'Vanessa' : 'Audio'} Mode (FPS: {fps})
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Avatar disabled for better performance
          </div>
        </div>
      </div>
    );
  }

  return (
    <TalkingAvatar
      text={text}
      onSpeechStart={onSpeechStart}
      onSpeechEnd={onSpeechEnd}
      className={className}
      avatarType={avatarType}
    />
  );
};
