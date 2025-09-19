
import React, { useState } from 'react';
import { AICompanion } from '@/types/chat';
import { SimpleFallbackAvatar } from './avatar/SimpleFallbackAvatar';

interface ReadyPlayerMeAvatarProps {
  companion: AICompanion;
  isAnimating: boolean;
  emotion?: 'neutral' | 'empathetic' | 'concerned' | 'supportive';
  className?: string;
  onStoppedSpeaking?: () => void;
}

const ReadyPlayerMeAvatar: React.FC<ReadyPlayerMeAvatarProps> = ({ 
  companion, 
  isAnimating, 
  emotion = 'neutral',
  className = '',
  onStoppedSpeaking
}) => {
  // Use working Ready Player Me avatars
  const avatarUrls = {
    vanessa: 'https://models.readyplayer.me/64bfa1f8a8a2b4001a6b0a4b.glb',
    monica: 'https://models.readyplayer.me/64bfa1f8a8a2b4001a6b0a4b.glb'
  };

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleModelError = () => {
    console.log('❌ Ready Player Me model failed, using fallback');
    setHasError(true);
    setIsLoading(false);
  };

  const handleModelLoaded = () => {
    console.log('✅ Ready Player Me model loaded successfully');
    setIsLoading(false);
  };

  // Use simple fallback avatar temporarily during migration
  return (
    <div className={`w-48 h-48 ${className} relative`}>
      <SimpleFallbackAvatar 
        isAnimating={isAnimating} 
        emotion={emotion}
        onStoppedSpeaking={onStoppedSpeaking}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-blue-800 bg-opacity-75 text-white text-xs p-1 text-center rounded-b-lg">
        3D Avatar Loading Temporarily Disabled During Migration
      </div>
      
      {isAnimating && (
        <div className="absolute top-0 left-0 right-0 bg-green-600 bg-opacity-75 text-white text-xs p-1 text-center rounded-t-lg animate-pulse">
          {companion === 'vanessa' ? 'Vanessa' : 'Monica'} is Speaking
        </div>
      )}
    </div>
  );
};

export default ReadyPlayerMeAvatar;
