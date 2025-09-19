import React from 'react';

interface FallbackAvatarProps {
  isAnimating: boolean;
  emotion: string;
  onStoppedSpeaking?: () => void;
}

export const FallbackAvatar: React.FC<FallbackAvatarProps> = ({ 
  isAnimating, 
  emotion, 
  onStoppedSpeaking 
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded">
      <span className="text-blue-700 text-sm">Fallback Avatar</span>
    </div>
  );
};