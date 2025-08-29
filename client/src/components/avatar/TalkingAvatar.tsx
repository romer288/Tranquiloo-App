
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { TalkingAvatarModel } from './TalkingAvatarModel';
import { VanessaTalkingAvatar } from './VanessaTalkingAvatar';
import { PrivacyNotice } from './PrivacyNotice';
import { AvatarControls } from './AvatarControls';
import { AvatarStatusIndicator } from './AvatarStatusIndicator';
import { AvatarSwitcher } from './AvatarSwitcher';
import { AvatarLoadingState } from './AvatarLoadingState';
import { AvatarErrorState } from './AvatarErrorState';
import { useTalkingAvatarState } from './hooks/useTalkingAvatarState';
import { Settings } from 'lucide-react';

interface TalkingAvatarProps {
  text: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  className?: string;
  avatarType?: 'default' | 'vanessa';
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({
  text,
  onSpeechStart,
  onSpeechEnd,
  className = '',
  avatarType = 'default'
}) => {
  const [showVanessa, setShowVanessa] = useState(avatarType === 'vanessa');
  
  const {
    isInitialized,
    isPlaying,
    timeline,
    error,
    loadingProgress,
    startTimeRef,
    startSpeaking,
    stopSpeaking
  } = useTalkingAvatarState(text);

  // If user specifically wants Vanessa, render her component
  if (showVanessa || avatarType === 'vanessa') {
    return (
      <div className={className}>
        <VanessaTalkingAvatar
          text={text}
          onSpeechStart={onSpeechStart}
          onSpeechEnd={onSpeechEnd}
          className="w-full h-full"
        />
        
        {/* Avatar switcher */}
        <div className="absolute top-2 left-2">
          <button
            onClick={() => setShowVanessa(false)}
            className="p-2 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 transition-all"
            title="Switch to simple avatar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return <AvatarErrorState error={error} className={className} />;
  }

  if (!isInitialized) {
    return <AvatarLoadingState loadingProgress={loadingProgress} className={className} />;
  }

  const handleStartSpeaking = () => startSpeaking(onSpeechStart, onSpeechEnd);
  const handleStopSpeaking = () => stopSpeaking(onSpeechEnd);

  return (
    <div className={`${className} relative`}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[2, 2, 2]} 
          intensity={1.0} 
          castShadow
        />
        <pointLight 
          position={[-1, 1, 1]} 
          intensity={0.4} 
        />
        
        <Suspense fallback={null}>
          <TalkingAvatarModel
            timeline={timeline}
            isPlaying={isPlaying}
            startTime={startTimeRef.current}
          />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      <AvatarSwitcher onSwitchToVanessa={() => setShowVanessa(true)} />
      
      <AvatarControls
        isPlaying={isPlaying}
        timeline={timeline}
        onStartSpeaking={handleStartSpeaking}
        onStopSpeaking={handleStopSpeaking}
      />
      
      <AvatarStatusIndicator isPlaying={isPlaying} />
      
      <PrivacyNotice />
    </div>
  );
};
