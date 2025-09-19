
import { useState, useEffect } from 'react';
// Temporarily disabled during migration
// import { useLoader } from '@react-three/fiber';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import * as THREE from 'three';

interface UseReadyPlayerMeLoaderProps {
  url: string;
  onError: () => void;
  onLoaded?: () => void;
}

export const useReadyPlayerMeLoader = ({ url, onError, onLoaded }: UseReadyPlayerMeLoaderProps) => {
  // Temporarily disabled during migration - fallback to simple avatar
  const [mixer, setMixer] = useState<any>(null);
  const [morphTargets, setMorphTargets] = useState<any>(null);
  const [headBone, setHeadBone] = useState<any>(null);

  useEffect(() => {
    // Simulate loading failure to trigger fallback
    console.log('3D avatar loading disabled during migration, using fallback');
    onError();
  }, [onError]);

  return { gltf: null, mixer, morphTargets, headBone };
};
