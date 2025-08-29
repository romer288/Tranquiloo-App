
import React from 'react';

interface AvatarStatusIndicatorProps {
  isPlaying: boolean;
}

export const AvatarStatusIndicator: React.FC<AvatarStatusIndicatorProps> = ({
  isPlaying
}) => {
  return (
    <div className="absolute top-2 right-2 pe-none">
      <div className={`w-2 h-2 rounded-full ${
        isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
      }`} />
    </div>
  );
};
