
import { useState, useEffect, useRef } from 'react';
import { AICompanion } from '@/types/chat';

interface EmotionState {
  emotion: 'neutral' | 'empathetic' | 'concerned' | 'supportive';
  intensity: number;
}

export const useAvatarAnimation = (companion: AICompanion) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>({
    emotion: 'neutral',
    intensity: 0.5
  });
  const [audioData, setAudioData] = useState<Float32Array>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();

  useEffect(() => {
    // Initialize audio context for real-time audio analysis
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    } catch (error) {
      console.warn('Audio context not available:', error);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startAnimation = (text: string) => {
    setIsAnimating(true);
    
    // Analyze text for emotional content
    const emotion = analyzeTextEmotion(text);
    setCurrentEmotion(emotion);

    // Start audio analysis if available
    if (analyserRef.current) {
      const dataArray = new Float32Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioData = () => {
        if (analyserRef.current && isAnimating) {
          analyserRef.current.getFloatFrequencyData(dataArray);
          setAudioData(new Float32Array(dataArray));
          requestAnimationFrame(updateAudioData);
        }
      };
      
      updateAudioData();
    }
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setCurrentEmotion({ emotion: 'neutral', intensity: 0.3 });
    setAudioData(undefined);
  };

  const analyzeTextEmotion = (text: string): EmotionState => {
    const lowerText = text.toLowerCase();
    
    // Keywords for different emotions
    const emotionKeywords = {
      empathetic: ['understand', 'feel', 'support', 'here for you', 'listening'],
      concerned: ['worry', 'anxiety', 'difficult', 'challenging', 'concern'],
      supportive: ['help', 'together', 'better', 'strength', 'capable', 'overcome']
    };

    let maxScore = 0;
    let detectedEmotion: 'neutral' | 'empathetic' | 'concerned' | 'supportive' = 'neutral';

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        return count + (lowerText.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as typeof detectedEmotion;
      }
    });

    return {
      emotion: detectedEmotion,
      intensity: Math.min(maxScore * 0.3 + 0.2, 1.0)
    };
  };

  const updateEmotionFromAnxietyAnalysis = (anxietyAnalysis: any) => {
    if (!anxietyAnalysis) return;

    // Map anxiety levels to avatar emotions
    const anxietyLevel = anxietyAnalysis.overallAnxietyLevel || 'low';
    
    let emotion: 'neutral' | 'empathetic' | 'concerned' | 'supportive' = 'neutral';
    let intensity = 0.5;

    switch (anxietyLevel) {
      case 'high':
        emotion = 'concerned';
        intensity = 0.8;
        break;
      case 'moderate':
        emotion = 'empathetic';
        intensity = 0.6;
        break;
      case 'low':
        emotion = 'supportive';
        intensity = 0.4;
        break;
      default:
        emotion = 'neutral';
        intensity = 0.3;
    }

    setCurrentEmotion({ emotion, intensity });
  };

  return {
    isAnimating,
    currentEmotion,
    audioData,
    startAnimation,
    stopAnimation,
    updateEmotionFromAnxietyAnalysis
  };
};
