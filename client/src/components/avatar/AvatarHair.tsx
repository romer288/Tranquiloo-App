import React from 'react';

interface AvatarHairProps {
  hairRef: React.RefObject<any>;
}

export const AvatarHair: React.FC<AvatarHairProps> = ({ hairRef }) => {
  return <div ref={hairRef}>Hair Disabled</div>;
};