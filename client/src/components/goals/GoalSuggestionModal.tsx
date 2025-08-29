import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, X } from 'lucide-react';
import { goalsService } from '@/services/goalsService';
import { useToast } from '@/hooks/use-toast';

interface SuggestedGoal {
  title: string;
  description: string;
  category: 'treatment' | 'self-care' | 'therapy' | 'mindfulness' | 'exercise' | 'social' | 'work' | 'sleep' | 'nutrition';
  target_value: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reason: string;
}

interface GoalSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedGoals: SuggestedGoal[];
  aiCompanion: 'vanessa' | 'monica';
}

export const GoalSuggestionModal: React.FC<GoalSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestedGoals,
  aiCompanion
}) => {
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const companionName = aiCompanion === 'vanessa' ? 'Vanessa' : 'Monica';

  const toggleGoalSelection = (index: number) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedGoals(newSelected);
  };

  const handleCreateGoals = async () => {
    if (selectedGoals.size === 0) return;

    setIsCreating(true);
    try {
      const promises = Array.from(selectedGoals).map(index => {
        const goal = suggestedGoals[index];
        return goalsService.createGoal({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          target_value: goal.target_value,
          unit: goal.unit,
          frequency: goal.frequency,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          is_active: true
        });
      });

      await Promise.all(promises);
      
      toast({
        title: 'Goals Created!',
        description: `Successfully created ${selectedGoals.size} goal(s). You can track them in your Goals section.`
      });

      onClose();
    } catch (error) {
      console.error('Error creating goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goals. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goal Suggestions from {companionName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Based on our conversation, I think these goals could help you on your journey. 
              Select the ones that resonate with you, and I'll add them to your Goals section where you can track your progress.
            </p>
          </div>

          <div className="grid gap-4">
            {suggestedGoals.map((goal, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedGoals.has(index) ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleGoalSelection(index)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {selectedGoals.has(index) ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                        {goal.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {goal.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {goal.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Target: {goal.target_value} {goal.unit} {goal.frequency}</span>
                  </div>
                  <div className="mt-2 p-3 bg-muted/30 rounded text-sm">
                    <strong>Why this goal:</strong> {goal.reason}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Maybe Later
            </Button>
            <Button 
              onClick={handleCreateGoals}
              disabled={selectedGoals.size === 0 || isCreating}
              className="min-w-[140px]"
            >
              {isCreating ? (
                'Creating...'
              ) : (
                `Create ${selectedGoals.size} Goal${selectedGoals.size === 1 ? '' : 's'}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};