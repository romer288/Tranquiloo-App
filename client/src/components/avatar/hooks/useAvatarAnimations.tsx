
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UseAvatarAnimationsProps {
  modelRef: React.RefObject<THREE.Group>;
  mixer: THREE.AnimationMixer | null;
  morphTargets: any;
  headBone: THREE.Bone | null;
  isAnimating: boolean;
  emotion: 'neutral' | 'empathetic' | 'concerned' | 'supportive';
  onStoppedSpeaking?: () => void;
}

export const useAvatarAnimations = ({
  modelRef,
  mixer,
  morphTargets,
  headBone,
  isAnimating,
  emotion,
  onStoppedSpeaking
}: UseAvatarAnimationsProps) => {
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }

    if (modelRef.current) {
      // Subtle breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.01;
      modelRef.current.scale.set(breathingScale, breathingScale, breathingScale);
    }

    // Natural head movement
    if (headBone) {
      const time = state.clock.elapsedTime;
      
      // Gentle head sway
      headBone.rotation.y = Math.sin(time * 0.2) * 0.05;
      
      // Subtle head nod when speaking
      if (isAnimating) {
        headBone.rotation.x = Math.sin(time * 1.5) * 0.03;
        headBone.rotation.z = Math.sin(time * 0.8) * 0.01;
      }
    }

    // Realistic lip-sync animation
    if (isAnimating && morphTargets && morphTargets.morphTargetDictionary) {
      const time = state.clock.elapsedTime;
      
      // Create realistic speech pattern
      const speechWave1 = Math.sin(time * 6) * 0.5;
      const speechWave2 = Math.sin(time * 9) * 0.3;
      const speechWave3 = Math.sin(time * 12) * 0.2;
      const speechIntensity = (speechWave1 + speechWave2 + speechWave3) * 0.4;
      
      // Animate common viseme targets
      const visemeTargets = [
        'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
        'mouthOpen', 'jawOpen', 'mouthSmile', 'mouthClose'
      ];
      
      visemeTargets.forEach(target => {
        const index = morphTargets.morphTargetDictionary[target];
        if (index !== undefined && morphTargets.morphTargetInfluences) {
          morphTargets.morphTargetInfluences[index] = Math.max(0, speechIntensity);
        }
      });

      // Random eye blinks
      const blinkTargets = ['eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed'];
      const shouldBlink = Math.random() < 0.02; // 2% chance per frame
      blinkTargets.forEach(target => {
        const index = morphTargets.morphTargetDictionary[target];
        if (index !== undefined && morphTargets.morphTargetInfluences) {
          morphTargets.morphTargetInfluences[index] = shouldBlink ? 1 : 0;
        }
      });
    }

    // Apply emotion-based expressions
    if (morphTargets && morphTargets.morphTargetDictionary) {
      const emotionIntensity = 0.4;
      
      // Reset all emotion targets first
      const allEmotionTargets = [
        'mouthSmile', 'mouthFrown', 'browDownLeft', 'browDownRight',
        'browInnerUp', 'eyeSquintLeft', 'eyeSquintRight', 'cheekPuff',
        'mouthPucker', 'mouthPress'
      ];
      
      allEmotionTargets.forEach(target => {
        const index = morphTargets.morphTargetDictionary[target];
        if (index !== undefined && morphTargets.morphTargetInfluences) {
          morphTargets.morphTargetInfluences[index] = 0;
        }
      });

      // Apply current emotion
      switch (emotion) {
        case 'empathetic':
          ['browInnerUp', 'mouthSmile'].forEach(target => {
            const index = morphTargets.morphTargetDictionary[target];
            if (index !== undefined && morphTargets.morphTargetInfluences) {
              morphTargets.morphTargetInfluences[index] = emotionIntensity * 0.3;
            }
          });
          break;
          
        case 'concerned':
          ['browDownLeft', 'browDownRight', 'browInnerUp'].forEach(target => {
            const index = morphTargets.morphTargetDictionary[target];
            if (index !== undefined && morphTargets.morphTargetInfluences) {
              morphTargets.morphTargetInfluences[index] = emotionIntensity * 0.5;
            }
          });
          break;
          
        case 'supportive':
          ['mouthSmile', 'eyeSquintLeft', 'eyeSquintRight'].forEach(target => {
            const index = morphTargets.morphTargetDictionary[target];
            if (index !== undefined && morphTargets.morphTargetInfluences) {
              morphTargets.morphTargetInfluences[index] = emotionIntensity * 0.6;
            }
          });
          break;
      }
    }
  });
};
