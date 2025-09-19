import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp, Calendar, AlertCircle, Trash2, Edit } from 'lucide-react';
import { goalsService } from '@/services/goalsService';
import { GoalWithProgress } from '@/types/goals';
import { GoalForm } from './GoalForm';
import { GoalProgressForm } from './GoalProgressForm';
import { useToast } from '@/hooks/use-toast';

export const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const userGoals = await goalsService.getUserGoals();
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      await goalsService.createGoal(goalData);
      await loadGoals();
      setShowCreateForm(false);
      toast({
        title: 'Success',
        description: 'Goal created successfully'
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive'
      });
    }
  };

  const handleRecordProgress = async (goalId: string, score: number, notes?: string) => {
    try {
      await goalsService.recordProgress(goalId, score, notes);
      await loadGoals();
      setShowProgressForm(null);
      toast({
        title: 'Success',
        description: 'Progress recorded successfully'
      });
    } catch (error) {
      console.error('Error recording progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to record progress',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateGoal = async (goalData: any) => {
    try {
      if (!editingGoal) return;
      await goalsService.updateGoal(editingGoal.id, goalData);
      await loadGoals();
      setEditingGoal(null);
      toast({
        title: 'Success',
        description: 'Goal updated successfully'
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalsService.deactivateGoal(goalId);
      await loadGoals();
      toast({
        title: 'Success',
        description: 'Goal deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive'
      });
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      treatment: 'bg-blue-100 text-blue-800',
      'self-care': 'bg-green-100 text-green-800',
      therapy: 'bg-purple-100 text-purple-800',
      mindfulness: 'bg-orange-100 text-orange-800',
      exercise: 'bg-red-100 text-red-800',
      social: 'bg-pink-100 text-pink-800',
      work: 'bg-gray-100 text-gray-800',
      sleep: 'bg-indigo-100 text-indigo-800',
      nutrition: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-6">Loading goals...</div>;
  }

  if (goals.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set</h3>
          <p className="text-gray-600 mb-4">
            Create your first goal to start tracking your progress toward better mental health.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </div>
        
        {showCreateForm && (
          <GoalForm
            onSubmit={handleCreateGoal}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
          <p className="text-sm text-gray-600">Track your progress toward better mental health</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => (
          <Card key={goal.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                </div>
                {goal.description && (
                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(goal.category)}>
                    {goal.category.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {goal.frequency}
                  </Badge>
                </div>
              </div>
            </div>

            {goal.target_value && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Target: {goal.target_value} {goal.unit}</span>
                  <span>{goal.frequency}</span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Average Score</span>
                <span>{(goal?.average_score !== null && goal?.average_score !== undefined && !isNaN(Number(goal.average_score)) ? Number(goal.average_score).toFixed(1) : '0.0')}/10</span>
              </div>
              <Progress 
                value={(goal.average_score / 10) * 100} 
                className="h-2"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Completion Rate</span>
                <span>{(goal?.completion_rate !== null && goal?.completion_rate !== undefined && !isNaN(Number(goal.completion_rate)) ? Number(goal.completion_rate).toFixed(0) : '0')}%</span>
              </div>
              <Progress 
                value={goal.completion_rate} 
                className="h-2"
              />
            </div>

            {goal.latest_progress && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Latest Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getProgressColor(goal.latest_progress.score)}`} />
                  <span className="text-sm text-gray-600">
                    Score: {goal.latest_progress.score}/10
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(goal.latest_progress.recorded_at).toLocaleDateString()}
                  </span>
                </div>
                {goal.latest_progress.notes && (
                  <p className="text-xs text-gray-600 mt-1">{goal.latest_progress.notes}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => setShowProgressForm(goal.id)}
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Record Progress
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setEditingGoal(goal)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDeleteGoal(goal.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showCreateForm && (
        <GoalForm
          onSubmit={handleCreateGoal}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingGoal && (
        <GoalForm
          initialData={editingGoal}
          onSubmit={handleUpdateGoal}
          onCancel={() => setEditingGoal(null)}
        />
      )}

      {showProgressForm && (
        <GoalProgressForm
          goalId={showProgressForm}
          goalTitle={goals.find(g => g.id === showProgressForm)?.title || ''}
          onSubmit={handleRecordProgress}
          onCancel={() => setShowProgressForm(null)}
        />
      )}
    </div>
  );
};