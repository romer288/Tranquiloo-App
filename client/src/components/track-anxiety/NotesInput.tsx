
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface NotesInputProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({
  notes,
  onNotesChange
}) => {
  return (
    <div>
      <label className="text-lg font-semibold text-gray-900 mb-3 block">
        Additional Notes (Optional)
      </label>
      <Textarea
        placeholder="Any other thoughts or observations..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="min-h-[100px]"
      />
    </div>
  );
};

export default NotesInput;
