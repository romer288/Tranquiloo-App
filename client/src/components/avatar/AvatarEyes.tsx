import React from 'react';

interface AvatarEyesProps {
  eyesRef: React.RefObject<any>;
}

export const AvatarEyes: React.FC<AvatarEyesProps> = ({ eyesRef }) => {
  return <div ref={eyesRef}>Eyes Disabled</div>;
};