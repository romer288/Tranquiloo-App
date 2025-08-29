
import { useEffect, useCallback } from 'react';
import { useVoiceSelection } from './speech/useVoiceSelection';
import { useSpeechState } from './speech/useSpeechState';

// Cache voices across hook instances to avoid repeated loading delays
let cachedVoices: SpeechSynthesisVoice[] | null = null;

export const useSpeechSynthesis = () => {
  const {
    isSpeaking,
    setIsSpeaking,
    speechSynthesisSupported,
    setSpeechSynthesisSupported,
    currentUtteranceRef,
    speechTimeoutRef,
    isProcessingRef,
    lastRequestIdRef
  } = useSpeechState();

  const { findBestVoiceForLanguage } = useVoiceSelection();

  // Check for speech synthesis support and preload voices for mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisSupported(true);
      console.log('🔊 Speech synthesis is supported');
      
      // Critical for mobile: Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          cachedVoices = voices;
        }
        console.log('🔊 Loaded', voices.length, 'voices for mobile compatibility');
        return voices;
      };
      
      // Mobile browsers require this event listener
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Try loading voices immediately
      loadVoices();
      
      // Mobile fix: Cancel any stuck speech on load
      window.speechSynthesis.cancel();
    } else {
      console.log('🔊 Speech synthesis is not supported');
      setSpeechSynthesisSupported(false);
    }
  }, [setSpeechSynthesisSupported]);

  // Resume/cancel safety on page lifecycle (iOS quirk)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && window.speechSynthesis?.paused) {
        try { window.speechSynthesis.resume(); } catch {}
      }
    };
    window.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onVis);
    return () => {
      window.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onVis);
    };
  }, []);

  const cancelSpeech = useCallback(() => {
    console.log('🔊 Cancelling speech');
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    isProcessingRef.current = false;
    currentUtteranceRef.current = null;
    lastRequestIdRef.current = null;
    setIsSpeaking(false);
  }, [speechTimeoutRef, isProcessingRef, currentUtteranceRef, lastRequestIdRef, setIsSpeaking]);

  const speakText = useCallback(async (text: string, language: 'en' | 'es' = 'en'): Promise<void> => {
    console.log('🔊 speakText called:', { text: text.substring(0, 50), language, isSpeaking, isProcessing: isProcessingRef.current });
    
    if (!speechSynthesisSupported) {
      console.log('🔊 Speech synthesis not supported');
      return;
    }

    if (!text.trim()) {
      console.log('🔊 Empty text, not speaking');
      return;
    }

    // Prevent multiple simultaneous speech requests
    if (isProcessingRef.current) {
      console.log('🔊 Speech already in progress, cancelling previous and starting new');
      cancelSpeech();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Cancel any existing speech
    if (isSpeaking) {
      console.log('🔊 Cancelling existing speech');
      cancelSpeech();
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Create unique request ID to prevent race conditions
    const requestId = Date.now().toString();
    lastRequestIdRef.current = requestId;
    isProcessingRef.current = true;

    return new Promise<void>((resolve, reject) => {
      try {
        // Check if request is still valid
        if (lastRequestIdRef.current !== requestId) {
          console.log('🔊 Request superseded, canceling');
          isProcessingRef.current = false;
          resolve();
          return;
        }

        // Mobile fix: Ensure voices are loaded before creating utterance
        let voices = cachedVoices || window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          console.log('🔊 No voices loaded, attempting to trigger load...');
          // Try to nudge, but do NOT block if still empty
          const dummy = new SpeechSynthesisUtterance('');
          try {
            window.speechSynthesis.speak(dummy);
            window.speechSynthesis.cancel();
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) cachedVoices = voices;
          } catch {}
          console.log('🔊 After trigger, voices available:', voices.length);
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = findBestVoiceForLanguage(language);
        
        // Prefer local voices if available (better for PWAs)
        const chosen = voice && voice.localService ? voice : 
          (voices.find(v => v.lang.startsWith(utterance.lang) && v.localService) || voice);
        
        if (chosen) {
          utterance.voice = chosen;
          console.log('🔊 Using selected voice:', chosen.name, 'Local:', chosen.localService, 'Lang:', chosen.lang);
        } else {
          console.log('🔊 No suitable voice found, using system default');
        }
        
        // Configure speech parameters - mobile-friendly settings
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US'; // Use US English for better mobile support
        utterance.rate = 1.0; // Normal speed for natural speech
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0; // Full volume for mobile speakers
        
        let hasCompleted = false;
        
        const complete = (reason = 'completed') => {
          if (hasCompleted) return;
          hasCompleted = true;
          
          console.log('🔊 Speech', reason);
          
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
            speechTimeoutRef.current = null;
          }
          
          isProcessingRef.current = false;
          currentUtteranceRef.current = null;
          setIsSpeaking(false);
          resolve();
        };
        
        utterance.onstart = () => {
          console.log('🔊 Speech started with voice:', utterance.voice?.name || 'system default');
          console.log('🔊 Speech text length:', text.length);
          console.log('🔊 Speech settings:', { rate: utterance.rate, pitch: utterance.pitch, volume: utterance.volume });
          setIsSpeaking(true);
          
          // Safety timeout - reduce to prevent 10 second delays
          const maxDuration = Math.max(8000, text.length * 60);
          console.log('🔊 Setting safety timeout for:', maxDuration, 'ms');
          speechTimeoutRef.current = setTimeout(() => {
            console.log('🔊 Speech timeout after', maxDuration, 'ms');
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
            complete('timed out');
          }, maxDuration);
        };
        
        utterance.onend = () => {
          console.log('🔊 Speech ended normally');
          complete('ended normally');
        };
        
        utterance.onerror = (event) => {
          console.error('🔊 Speech error details:', {
            error: event.error,
            type: event.type,
            timeStamp: event.timeStamp
          });
          complete('ended with error: ' + event.error);
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            reject(new Error(`Speech error: ${event.error}`));
            return;
          }
        };
        
        currentUtteranceRef.current = utterance;
        
        console.log('🔊 Starting speech with mobile-friendly settings...');
        console.log('🔊 Speech synthesis voices available:', window.speechSynthesis.getVoices().length);
        
        // Mobile fix: Always cancel before speaking to clear any stuck state
        window.speechSynthesis.cancel();
        
        // Mobile browsers need a small delay after cancel
        setTimeout(() => {
          // Check if speech synthesis is ready
          if (window.speechSynthesis.paused) {
            console.log('🔊 Speech synthesis was paused, resuming...');
            window.speechSynthesis.resume();
          }
          
          // Mobile fix: Some browsers need user interaction first
          // Add utterance to queue
          try {
            // For mobile: Ensure we're not speaking too fast
            if (window.speechSynthesis.speaking) {
              console.log('🔊 Already speaking, cancelling and restarting');
              window.speechSynthesis.cancel();
              setTimeout(() => {
                try { window.speechSynthesis.resume(); } catch {}
                window.speechSynthesis.speak(utterance);
                console.log('🔊 Restarted speech after cancel');
              }, 100);
            } else {
              try { window.speechSynthesis.resume(); } catch {}
              window.speechSynthesis.speak(utterance);
              console.log('🔊 Speech command sent successfully');
              
              // Mobile workaround: Sometimes speech doesn't start immediately
              setTimeout(() => {
                if (!window.speechSynthesis.speaking && !hasCompleted) {
                  console.log('🔊 Speech not started, trying resume...');
                  window.speechSynthesis.resume();
                  
                  // Last resort: try speaking again
                  setTimeout(() => {
                    if (!window.speechSynthesis.speaking && !hasCompleted) {
                      console.log('🔊 Final attempt to speak');
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utterance);
                    }
                  }, 200);
                }
              }, 500);
            }
          } catch (speakError) {
            console.error('🔊 Error calling speak:', speakError);
            complete('failed to speak');
          }
        }, 50);
        
      } catch (error) {
        console.error('🔊 Error creating speech:', error);
        isProcessingRef.current = false;
        setIsSpeaking(false);
        reject(error);
      }
    });
  }, [speechSynthesisSupported, findBestVoiceForLanguage, isSpeaking, isProcessingRef, currentUtteranceRef, speechTimeoutRef, setIsSpeaking, lastRequestIdRef, cancelSpeech]);

  const stopSpeaking = useCallback(() => {
    console.log('🔊 stopSpeaking called');
    cancelSpeech();
  }, [cancelSpeech]);

  return {
    speechSynthesisSupported,
    isSpeaking,
    speakText,
    stopSpeaking
  };
};
