
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface AnxietyLevelSliderProps {
  anxietyLevel: number[];
  onAnxietyLevelChange: (value: number[]) => void;
}

const AnxietyLevelSlider: React.FC<AnxietyLevelSliderProps> = ({
  anxietyLevel,
  onAnxietyLevelChange
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="text-lg font-semibold text-gray-900">
          Current Anxiety Level: {anxietyLevel[0]}/10
        </label>
      </div>
      
      <div className="px-4">
        <Slider
          value={anxietyLevel}
          onValueChange={onAnxietyLevelChange}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>1 - Calm</span>
          <span>5 - Moderate</span>
          <span>10 - Severe</span>
        </div>
      </div>
    </div>
  );
};

export default AnxietyLevelSlider;
