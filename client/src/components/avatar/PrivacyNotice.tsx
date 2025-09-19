
import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-xl pe-none">
      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3" />
        <span>Avatar generated locally; no camera or mic data collected</span>
      </div>
    </div>
  );
};
