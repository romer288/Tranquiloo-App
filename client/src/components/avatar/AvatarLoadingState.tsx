
import React from 'react';
import { Loader2 } from 'lucide-react';
import { PrivacyNotice } from './PrivacyNotice';

interface AvatarLoadingStateProps {
  loadingProgress: number;
  className?: string;
}

export const AvatarLoadingState: React.FC<AvatarLoadingStateProps> = ({
  loadingProgress,
  className = ''
}) => {
  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 rounded-xl relative`}>
      <div className="text-center p-4">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <div className="text-xs text-gray-600">Loading 3D Avatar...</div>
        <div className="w-32 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>
      <PrivacyNotice />
    </div>
  );
};
