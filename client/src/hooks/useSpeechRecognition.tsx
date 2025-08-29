
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechUnlocked, setSpeechUnlocked] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const onResultCallbackRef = useRef<((transcript: string) => void) | null>(null);
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  useEffect(() => {
    console.log('Initializing speech recognition...');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('Speech recognition is available');
      setSpeechSupported(true);
      
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          console.log('Speech recognition result received');
          lastSpeechTimeRef.current = Date.now();
          
          // Clear existing silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }

          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            finalTranscriptRef.current += finalTranscript + ' ';
            console.log('Final transcript so far:', finalTranscriptRef.current);
          }

          // Set 7-second silence timer
          if (finalTranscript || interimTranscript) {
            silenceTimerRef.current = setTimeout(() => {
              console.log('7-second silence detected, ending speech recognition');
              if (recognitionRef.current && isListening) {
                const fullTranscript = finalTranscriptRef.current.trim();
                if (fullTranscript && onResultCallbackRef.current) {
                  console.log('Final complete transcript:', fullTranscript);
                  onResultCallbackRef.current(fullTranscript);
                }
                recognitionRef.current.stop();
              }
            }, 7000); // 7 seconds silence timeout
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Clean up all timers
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          if (maxDurationTimerRef.current) {
            clearTimeout(maxDurationTimerRef.current);
            maxDurationTimerRef.current = null;
          }
          
          setIsListening(false);
          
          // Don't show error toast for 'aborted' - this happens when user interrupts by typing
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            toast({
              title: "Speech Recognition Error",
              description: `Error: ${event.error}. Please try again or type your message.`,
              variant: "destructive",
            });
          } else if (event.error === 'aborted') {
            console.log('Speech recognition aborted (likely user interrupted by typing)');
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          
          // Clean up all timers
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          if (maxDurationTimerRef.current) {
            clearTimeout(maxDurationTimerRef.current);
            maxDurationTimerRef.current = null;
          }
          
          setIsListening(false);
          
          const fullTranscript = finalTranscriptRef.current.trim();
          if (fullTranscript && onResultCallbackRef.current) {
            console.log('Sending final transcript on end:', fullTranscript);
            onResultCallbackRef.current(fullTranscript);
          }
          
          // Reset for next session
          finalTranscriptRef.current = '';
          onResultCallbackRef.current = null;
          lastSpeechTimeRef.current = 0;
        };

      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setSpeechSupported(false);
      }
    } else {
      console.log('Speech recognition not available in this browser');
      setSpeechSupported(false);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
    };
  }, [toast]);

  const startListening = (onResult: (transcript: string) => void, language: 'en' | 'es' = 'en') => {
    if (!speechSupported) {
      toast({
        title: "Microphone Not Available",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    // For mobile/PWA: ensure speech is unlocked by user gesture
    if (!speechUnlocked) {
      setSpeechUnlocked(true);
      console.log('Speech recognition unlocked by user gesture');
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      
      // Clean up all timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }
      
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      console.log('Starting speech recognition for language:', language);
      try {
        // Check if recognition object exists
        if (!recognitionRef.current) {
          console.error('Recognition object not available');
          toast({
            title: "Microphone Error",
            description: "Speech recognition not properly initialized.",
            variant: "destructive",
          });
          return;
        }

        // Reset state for new session
        finalTranscriptRef.current = '';
        onResultCallbackRef.current = onResult;
        lastSpeechTimeRef.current = Date.now();
        
        recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US';
        
        // Set state first, then try to start
        setIsListening(true);
        
        // Add a small delay to ensure state is set
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            console.log('✅ Speech recognition started successfully');
            
            // Set maximum duration timer (8 seconds total)
            maxDurationTimerRef.current = setTimeout(() => {
              console.log('Maximum duration reached (8s), forcing stop');
              if (recognitionRef.current && isListening) {
                const fullTranscript = finalTranscriptRef.current.trim();
                if (fullTranscript && onResultCallbackRef.current) {
                  console.log('Sending transcript due to max duration:', fullTranscript);
                  onResultCallbackRef.current(fullTranscript);
                }
                recognitionRef.current.stop();
              }
            }, 8000); // Maximum 8 seconds
            
          } catch (startError) {
            console.error('Error calling start():', startError);
            setIsListening(false);
            toast({
              title: "Microphone Error", 
              description: "Failed to start recording. Try clicking the microphone button again.",
              variant: "destructive",
            });
          }
        }, 50);
        
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        toast({
          title: "Microphone Error",
          description: "Speech recognition setup failed. Please refresh the page.",
          variant: "destructive",
        });
      }
    }
  };

  const autoStartListening = (onResult: (transcript: string) => void, language: 'en' | 'es' = 'en', delay: number = 500) => {
    if (!speechSupported || isListening) {
      return;
    }

    console.log(`Auto-starting microphone in ${delay}ms...`);
    
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
    }

    autoStartTimeoutRef.current = setTimeout(() => {
      console.log('Auto-starting speech recognition');
      startListening(onResult, language);
    }, delay);
  };

  return {
    isListening,
    speechSupported,
    startListening,
    autoStartListening
  };
};
