
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useReadyPlayerMeLoader } from './hooks/useReadyPlayerMeLoader';
import { useAvatarAnimations } from './hooks/useAvatarAnimations';

interface ReadyPlayerMeModelProps {
  url: string;
  isAnimating: boolean;
  emotion: 'neutral' | 'empathetic' | 'concerned' | 'supportive';
  onError: () => void;
  onLoaded?: () => void;
  onStoppedSpeaking?: () => void;
}

export const ReadyPlayerMeModel: React.FC<ReadyPlayerMeModelProps> = ({ 
  url, 
  isAnimating, 
  emotion, 
  onError,
  onLoaded,
  onStoppedSpeaking
}) => {
  const modelRef = useRef<THREE.Group>(null);
  
  const { gltf, mixer, morphTargets, headBone } = useReadyPlayerMeLoader({
    url,
    onError,
    onLoaded
  });

  useAvatarAnimations({
    modelRef,
    mixer,
    morphTargets,
    headBone,
    isAnimating,
    emotion,
    onStoppedSpeaking
  });

  if (!gltf) return null;

  return (
    <group ref={modelRef}>
      <primitive object={gltf.scene} />
    </group>
  );
};
