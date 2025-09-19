
import React from 'react';
import { Settings } from 'lucide-react';

interface AvatarSwitcherProps {
  onSwitchToVanessa: () => void;
}

export const AvatarSwitcher: React.FC<AvatarSwitcherProps> = ({
  onSwitchToVanessa
}) => {
  return (
    <div className="absolute top-2 left-2">
      <button
        onClick={onSwitchToVanessa}
        className="p-2 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 transition-all"
        title="Switch to Vanessa"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};
