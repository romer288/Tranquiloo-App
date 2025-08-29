import React from 'react';

interface AvatarMouthProps {
  mouthRef: React.RefObject<any>;
}

export const AvatarMouth: React.FC<AvatarMouthProps> = ({ mouthRef }) => {
  return <div ref={mouthRef}>Mouth Disabled</div>;
};