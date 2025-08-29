import React from 'react';

interface DisabledAvatarProps {
  className?: string;
  children?: React.ReactNode;
}

export const DisabledAvatar: React.FC<DisabledAvatarProps> = ({ className = '', children }) => {
  return (
    <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`}>
      <span className="text-gray-600 text-sm">3D Avatar Temporarily Disabled</span>
      {children}
    </div>
  );
};

// Export all the avatar components as disabled versions
export const AvatarEyes = DisabledAvatar;
export const AvatarHead = DisabledAvatar;
export const AvatarMouth = DisabledAvatar;
export const AvatarHair = DisabledAvatar;
export const FallbackAvatar = DisabledAvatar;
export const RealisticAvatar = DisabledAvatar;
export const BlondeAvatar = DisabledAvatar;
export const TalkingAvatarModel = DisabledAvatar;

export const useAvatarAnimations = () => ({ /* disabled */ });
export const useReadyPlayerMeLoader = () => ({ gltf: null, mixer: null, morphTargets: null, headBone: null });