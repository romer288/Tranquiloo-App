
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import useLipSync from '@/hooks/useLipSync';
import { VisemeFrame } from '@/utils/viseme';

interface VisemeTimeline {
  frames: VisemeFrame[];
  duration: number;
}

interface TalkingAvatarModelProps {
  timeline: VisemeTimeline | null;
  isPlaying: boolean;
  startTime: number;
}

export const TalkingAvatarModel: React.FC<TalkingAvatarModelProps> = ({
  timeline,
  isPlaying,
  startTime
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [avatarMesh, setAvatarMesh] = useState<THREE.Mesh | null>(null);
  
  // Convert timeline to the format expected by useLipSync
  const timelineFrames = timeline ? timeline.frames : null;
  
  // For now, create a simple geometric avatar until we have the GLB file
  const lipSyncState = useLipSync(
    { current: avatarMesh },
    timelineFrames,
    null // We'll handle audio separately
  );

  // Basic breathing animation
  useFrame((state) => {
    if (meshRef.current) {
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
      meshRef.current.scale.set(breathingScale, breathingScale, breathingScale);
      
      // Subtle head movement
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });

  // Set up the avatar mesh reference when component mounts
  React.useEffect(() => {
    if (meshRef.current) {
      setAvatarMesh(meshRef.current);
    }
  }, []);

  // Calculate mouth scale based on lip sync state
  const mouthScale: [number, number, number] = [
    1 + (lipSyncState.mouthWeights[0] || 0) * 0.5,
    1 + (lipSyncState.jawWeight || 0) * 0.3,
    1
  ];

  return (
    <group>
      {/* Simple geometric avatar for now - replace with GLB model */}
      <mesh ref={meshRef} position={[0, -0.5, 0]}>
        {/* Head */}
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshLambertMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.3, 0.1, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.1, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* Mouth - this will be animated by lip-sync */}
      <mesh 
        position={[0, -0.3, 0.6]} 
        scale={mouthScale}
      >
        <sphereGeometry args={[0.15, 16, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 0, 0.7]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshLambertMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Debug info */}
      {isPlaying && (
        <group position={[0, 1.5, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.3]} />
            <meshBasicMaterial color="#000000" opacity={0.7} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Preload any required assets
useGLTF.preload('/models/avatar.glb'); // Placeholder for future GLB model
