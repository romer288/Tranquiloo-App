
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TriggerSelectorProps {
  trigger: string;
  onTriggerChange: (value: string) => void;
}

const TriggerSelector: React.FC<TriggerSelectorProps> = ({
  trigger,
  onTriggerChange
}) => {
  return (
    <div>
      <label className="text-lg font-semibold text-gray-900 mb-3 block">
        What's causing your anxiety? (Optional)
      </label>
      <Select value={trigger} onValueChange={onTriggerChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a trigger category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="work">Work/Career</SelectItem>
          <SelectItem value="social">Social Situations</SelectItem>
          <SelectItem value="health">Health Concerns</SelectItem>
          <SelectItem value="financial">Financial Stress</SelectItem>
          <SelectItem value="relationships">Relationships</SelectItem>
          <SelectItem value="future">Future/Uncertainty</SelectItem>
          <SelectItem value="family">Family Issues</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TriggerSelector;
