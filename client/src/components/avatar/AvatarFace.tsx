import React, { useRef, useState } from 'react';
// Temporarily disabled during migration
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
import { AICompanion } from '@/types/chat';
// Temporarily disabled during migration  
// import { AvatarHead } from './AvatarHead';
// import { AvatarEyes } from './AvatarEyes';
// import { AvatarMouth } from './AvatarMouth';
// import { AvatarHair } from './AvatarHair';

interface AvatarFaceProps {
  companion: AICompanion;
  isAnimating: boolean;
  audioData?: Float32Array;
  emotion: 'neutral' | 'empathetic' | 'concerned' | 'supportive';
  onStoppedSpeaking?: () => void;
}

export const AvatarFace: React.FC<AvatarFaceProps> = ({ 
  companion, 
  isAnimating, 
  audioData, 
  emotion, 
  onStoppedSpeaking 
}) => {
  // Temporarily disabled during migration - return null or simple div
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
      <span className="text-gray-600 text-sm">3D Avatar Temporarily Disabled</span>
    </div>
  );
};
