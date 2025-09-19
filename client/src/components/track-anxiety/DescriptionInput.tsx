
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff } from 'lucide-react';

interface DescriptionInputProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({
  description,
  onDescriptionChange,
  isListening,
  onToggleListening
}) => {
  return (
    <div>
      <label className="text-lg font-semibold text-gray-900 mb-3 block">
        Describe the situation (Optional)
      </label>
      <div className="relative">
        <Textarea
          placeholder="What specifically is making you feel anxious right now?"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="min-h-[100px] pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 ${isListening ? 'text-red-500' : 'text-gray-500'}`}
          onClick={onToggleListening}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      {isListening && (
        <p className="text-sm text-red-500 mt-1">Listening... Speak now</p>
      )}
    </div>
  );
};

export default DescriptionInput;
