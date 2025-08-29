
import React from 'react';
import { AICompanion } from '@/types/chat';
import { DisabledAvatar } from './DisabledAvatar';

interface RealisticAvatarProps {
  companion: AICompanion;
  isAnimating: boolean;
  emotion?: 'neutral' | 'empathetic' | 'concerned' | 'supportive';
  className?: string;
  onStoppedSpeaking?: () => void;
}

export const RealisticAvatar: React.FC<RealisticAvatarProps> = ({ 
  companion, 
  isAnimating, 
  emotion = 'neutral',
  className = '',
  onStoppedSpeaking
}) => {
  return (
    <DisabledAvatar className={`w-48 h-48 ${className}`}>
      <div className="absolute bottom-0 left-0 right-0 bg-orange-600 bg-opacity-75 text-white text-xs p-1 text-center rounded-b-lg">
        Realistic Avatar (3D Disabled During Migration)
      </div>
      {isAnimating && (
        <div className="absolute top-0 left-0 right-0 bg-green-600 bg-opacity-75 text-white text-xs p-1 text-center rounded-t-lg animate-pulse">
          {companion === 'vanessa' ? 'Vanessa' : 'Monica'} is Speaking
        </div>
      )}
    </DisabledAvatar>
  );
};
