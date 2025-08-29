import { useState, useEffect, useRef } from 'react';

export default function useFPS(sampleSize = 60) {
  const [fps, setFps] = useState(60);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const rafRef = useRef<number>();

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      
      if (delta > 0) {
        const currentFPS = Math.round(1000 / delta);
        setFps(currentFPS);
        
        // Keep history of frames for averaging
        fpsHistoryRef.current.push(currentFPS);
        if (fpsHistoryRef.current.length > sampleSize) {
          fpsHistoryRef.current.shift();
        }
        
        // Check if average FPS is below threshold
        if (fpsHistoryRef.current.length >= 30) {
          const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
          if (avgFPS < 25 && !isLowPerformance) {
            console.log('Low performance detected, average FPS:', avgFPS);
            setIsLowPerformance(true);
          }
        }
      }
      
      rafRef.current = requestAnimationFrame(measureFPS);
    };

    rafRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sampleSize, isLowPerformance]);

  return { fps, isLowPerformance };
}
