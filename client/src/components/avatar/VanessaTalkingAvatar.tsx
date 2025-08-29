
import React, { useState, useEffect } from 'react';
import { BlondeAvatar } from './BlondeAvatar';
import { PrivacyNotice } from './PrivacyNotice';
import { Loader2, Heart } from 'lucide-react';
import useFPS from '@/hooks/useFPS';

interface VanessaTalkingAvatarProps {
  text: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  className?: string;
}

export const VanessaTalkingAvatar: React.FC<VanessaTalkingAvatarProps> = ({
  text,
  onSpeechStart,
  onSpeechEnd,
  className = ''
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { fps, isLowPerformance } = useFPS();

  // Initialize Vanessa
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing Vanessa...');
        setLoadingProgress(25);
        
        // Initialize TTS and viseme systems
        const { initializePiper } = await import('@/utils/tts');
        await initializePiper();
        setLoadingProgress(75);
        
        setLoadingProgress(100);
        setIsInitialized(true);
        console.log('Vanessa initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Vanessa:', error);
        setError('Failed to initialize Vanessa');
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (text) {
      onSpeechStart?.();
      // Speech end will be handled by the BlondeAvatar component
      const timer = setTimeout(() => {
        onSpeechEnd?.();
      }, Math.max(2000, text.length * 80)); // Rough estimate
      
      return () => clearTimeout(timer);
    }
  }, [text, onSpeechStart, onSpeechEnd]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl relative`}>
        <div className="text-center p-4">
          <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
          <div className="text-pink-600 text-sm mb-2">Vanessa Error</div>
          <div className="text-xs text-gray-600">{error}</div>
        </div>
        <PrivacyNotice />
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl relative`}>
        <div className="text-center p-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-500" />
          <div className="text-sm text-pink-700 font-medium">Loading Vanessa...</div>
          <div className="text-xs text-gray-600 mt-1">Your AI companion</div>
          <div className="w-32 h-2 bg-pink-200 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
        <PrivacyNotice />
      </div>
    );
  }

  // Show fallback if performance is too low
  if (isLowPerformance) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl relative`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
          </div>
          <div className="text-xs text-gray-600">
            Vanessa Mode (FPS: {fps})
          </div>
          <div className="text-xs text-gray-500 mt-1">
            3D Avatar disabled for better performance
          </div>
        </div>
        <PrivacyNotice />
      </div>
    );
  }

  return (
    <div className={`${className} relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl overflow-hidden`}>
      <BlondeAvatar
        text={text}
        className="w-full h-full"
      />
      
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
      </div>
      
      {/* Vanessa branding */}
      <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        Vanessa
      </div>
      
      <PrivacyNotice />
    </div>
  );
};
