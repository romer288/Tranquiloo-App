import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface GoalProgressFormProps {
  goalId: string;
  goalTitle: string;
  onSubmit: (goalId: string, score: number, notes?: string) => void;
  onCancel: () => void;
}

export const GoalProgressForm: React.FC<GoalProgressFormProps> = ({ 
  goalId, 
  goalTitle, 
  onSubmit, 
  onCancel 
}) => {
  const [score, setScore] = useState([5]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(goalId, score[0], notes || undefined);
  };

  const getScoreDescription = (value: number) => {
    if (value >= 9) return 'Excellent progress!';
    if (value >= 7) return 'Good progress';
    if (value >= 5) return 'Making progress';
    if (value >= 3) return 'Some challenges';
    return 'Difficult day';
  };

  const getScoreColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Progress</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 mb-2">{goalTitle}</h3>
          <p className="text-sm text-gray-600">
            How well did you achieve this goal today? Rate from 1 (very difficult) to 10 (excellent).
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Progress Score</Label>
              <span className={`text-sm font-medium ${getScoreColor(score[0])}`}>
                {score[0]}/10 - {getScoreDescription(score[0])}
              </span>
            </div>
            
            <Slider
              value={score}
              onValueChange={setScore}
              max={10}
              min={1}
              step={1}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Difficult (1)</span>
              <span>Excellent (10)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your progress, challenges, or thoughts..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Record Progress
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};