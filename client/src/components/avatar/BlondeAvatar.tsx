import React from 'react';

interface BlondeAvatarModelProps {
  text: string;
}

function BlondeAvatarModel({ text }: BlondeAvatarModelProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-yellow-100 rounded">
      <span className="text-yellow-700 text-sm">Blonde Avatar Disabled</span>
    </div>
  );
}

export default BlondeAvatarModel;