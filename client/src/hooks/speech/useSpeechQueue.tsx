
import { useRef } from 'react';

interface QueueItem {
  text: string;
  language: 'en' | 'es';
}

export const useSpeechQueue = () => {
  const speechQueueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef(false);

  const addToQueue = (text: string, language: 'en' | 'es') => {
    console.log('Adding to speech queue:', text.substring(0, 50), 'Language:', language);
    
    // Clear existing queue and add new item
    speechQueueRef.current = [{ text, language }];
  };

  const clearQueue = () => {
    console.log('Clearing speech queue');
    speechQueueRef.current = [];
    isProcessingRef.current = false;
  };

  const getNextItem = (): QueueItem | null => {
    if (speechQueueRef.current.length === 0) {
      return null;
    }
    return speechQueueRef.current.shift()!;
  };

  const hasItems = () => speechQueueRef.current.length > 0;

  const setProcessing = (processing: boolean) => {
    isProcessingRef.current = processing;
  };

  const isProcessing = () => isProcessingRef.current;

  return {
    addToQueue,
    clearQueue,
    getNextItem,
    hasItems,
    setProcessing,
    isProcessing
  };
};
