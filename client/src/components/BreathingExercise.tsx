
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycle, setCycle] = useState(0);

  const phases = {
    inhale: { duration: 4, next: 'hold' as const, text: 'Breathe In' },
    hold: { duration: 7, next: 'exhale' as const, text: 'Hold' },
    exhale: { duration: 8, next: 'inhale' as const, text: 'Breathe Out' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      const currentPhase = phases[phase];
      const nextPhase = currentPhase.next;
      setPhase(nextPhase);
      setTimeLeft(phases[nextPhase].duration);
      
      if (phase === 'exhale') {
        setCycle(cycle + 1);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, phase, cycle]);

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimeLeft(4);
    setCycle(0);
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1 + (0.5 * (phases.inhale.duration - timeLeft) / phases.inhale.duration);
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1.5 - (0.5 * (phases.exhale.duration - timeLeft) / phases.exhale.duration);
      default:
        return 1;
    }
  };

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">4-7-8 Breathing Exercise</h2>
      
      <div className="relative w-64 h-64 mx-auto mb-8">
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 transition-transform duration-1000 ease-in-out flex items-center justify-center"
          style={{ transform: `scale(${getCircleScale()})` }}
        >
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700">{phases[phase].text}</div>
            <div className="text-3xl font-bold text-gray-800">{timeLeft}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-2">Cycle: {cycle}</p>
        <p className="text-sm text-gray-500">Complete 4 cycles for best results</p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={toggleExercise} className="bg-blue-500 hover:bg-blue-600">
          {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetExercise} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default BreathingExercise;
