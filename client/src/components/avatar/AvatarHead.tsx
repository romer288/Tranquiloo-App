import React from 'react';

interface AvatarHeadProps {
  meshRef: React.RefObject<any>;
}

export const AvatarHead: React.FC<AvatarHeadProps> = ({ meshRef }) => {
  return <div ref={meshRef}>Head Disabled</div>;
};