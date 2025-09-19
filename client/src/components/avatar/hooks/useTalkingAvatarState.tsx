
import { useState, useEffect, useRef } from 'react';
import { synthesize } from '@/utils/tts';
import { toVisemes, VisemeFrame } from '@/utils/viseme';
import { WASMLoader } from '@/utils/wasmLoader';

interface VisemeTimeline {
  frames: VisemeFrame[];
  duration: number;
}

interface SpeechSynthesisResult {
  audioBuffer: AudioBuffer;
  phonemes: any[];
  duration: number;
}

export const useTalkingAvatarState = (text: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeline, setTimeline] = useState<VisemeTimeline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize the speech synthesis system
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing talking avatar...');
        setLoadingProgress(25);
        
        // Load WASM modules
        await Promise.all([
          WASMLoader.loadPiperWASM(),
          WASMLoader.loadRhubarbLipSync()
        ]);
        setLoadingProgress(75);
        
        setLoadingProgress(100);
        setIsInitialized(true);
        console.log('Talking avatar initialized successfully');
      } catch (error) {
        console.error('Failed to initialize talking avatar:', error);
        setError('Failed to initialize 3D avatar system');
      }
    };

    initialize();
  }, []);

  // Process new text for speech synthesis
  useEffect(() => {
    if (!text || !isInitialized || isPlaying) return;

    const processText = async () => {
      try {
        setError(null);
        console.log('Processing text for speech:', text);

        // Synthesize speech
        const speechResult = await synthesize(text);
        
        // Generate viseme timeline
        const visemeFrames = await toVisemes(speechResult.phonemeJson);
        const visemeTimeline: VisemeTimeline = {
          frames: visemeFrames,
          duration: visemeFrames.length > 0 ? Math.max(...visemeFrames.map(f => f.time)) : 0
        };
        setTimeline(visemeTimeline);

        console.log('Speech processing complete:', {
          duration: speechResult.audioBuffer.duration,
          phonemes: speechResult.phonemeJson.length,
          visemeFrames: visemeFrames.length
        });

      } catch (error) {
        console.error('Failed to process text:', error);
        setError('Failed to process speech');
      }
    };

    processText();
  }, [text, isInitialized, isPlaying]);

  const startSpeaking = async (onSpeechStart?: () => void, onSpeechEnd?: () => void) => {
    if (!timeline || isPlaying) return;

    try {
      setIsPlaying(true);
      startTimeRef.current = Date.now();
      onSpeechStart?.();

      // Synthesize and play audio
      const speechResult = await synthesize(text);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = speechResult.audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      audioSourceRef.current = source;

      // Stop when audio ends
      source.onended = () => {
        setIsPlaying(false);
        onSpeechEnd?.();
        audioSourceRef.current = null;
      };

    } catch (error) {
      console.error('Failed to start speaking:', error);
      setIsPlaying(false);
      setError('Failed to start speech playback');
    }
  };

  const stopSpeaking = (onSpeechEnd?: () => void) => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
    onSpeechEnd?.();
  };

  return {
    isInitialized,
    isPlaying,
    timeline,
    error,
    loadingProgress,
    startTimeRef,
    startSpeaking,
    stopSpeaking
  };
};
