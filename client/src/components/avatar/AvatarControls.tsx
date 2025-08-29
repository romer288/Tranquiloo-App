
import React from 'react';

interface AvatarControlsProps {
  isPlaying: boolean;
  timeline: any;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
}

export const AvatarControls: React.FC<AvatarControlsProps> = ({
  isPlaying,
  timeline,
  onStartSpeaking,
  onStopSpeaking
}) => {
  return (
    <div className="absolute bottom-8 left-2 right-2 flex justify-center gap-2">
      <button
        onClick={isPlaying ? onStopSpeaking : onStartSpeaking}
        disabled={!timeline}
        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isPlaying ? 'Stop' : 'Speak'}
      </button>
    </div>
  );
};
