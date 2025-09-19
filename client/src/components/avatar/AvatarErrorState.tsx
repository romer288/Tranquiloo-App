
import React from 'react';
import { PrivacyNotice } from './PrivacyNotice';

interface AvatarErrorStateProps {
  error: string;
  className?: string;
}

export const AvatarErrorState: React.FC<AvatarErrorStateProps> = ({
  error,
  className = ''
}) => {
  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 rounded-xl relative`}>
      <div className="text-center p-4">
        <div className="text-red-500 text-sm mb-2">Avatar Error</div>
        <div className="text-xs text-gray-600">{error}</div>
      </div>
      <PrivacyNotice />
    </div>
  );
};
