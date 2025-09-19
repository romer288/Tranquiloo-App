// Goals service - migrated from Supabase to new API endpoints
import { Goal, GoalProgress, GoalWithProgress } from '@/types/goals';

const calculateCompletionRate = (goal: any): number => {
  if (!goal.goal_progress || goal.goal_progress.length === 0) return 0;
  
  const today = new Date();
  const startDate = new Date(goal.start_date);
  const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let expectedEntries: number;
  switch (goal.frequency) {
    case 'daily':
      expectedEntries = Math.max(1, daysSinceStart);
      break;
    case 'weekly':
      expectedEntries = Math.max(1, Math.ceil(daysSinceStart / 7));
      break;
    case 'monthly':
      expectedEntries = Math.max(1, Math.ceil(daysSinceStart / 30));
      break;
    default:
      expectedEntries = 1;
  }
  
  const actualEntries = goal.goal_progress.length;
  return Math.min(100, (actualEntries / expectedEntries) * 100);
};

export const goalsService = {
  async getUserGoals(): Promise<GoalWithProgress[]> {
    try {
      // Get current user from auth service
      const authUser = localStorage.getItem('auth_user');
      if (!authUser) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(authUser);
      
      const response = await fetch(`/api/users/${user.id}/goals`);
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const goals = await response.json();
      
      return goals.map((goal: any) => ({
        ...goal,
        category: goal.category as Goal['category'],
        frequency: goal.frequency as Goal['frequency'],
        latest_progress: goal.goal_progress?.[0] || null,
        progress_history: goal.goal_progress || [],
        average_score: goal.goal_progress?.length > 0 
          ? goal.goal_progress.reduce((sum: number, p: any) => sum + p.score, 0) / goal.goal_progress.length
          : 0,
        completion_rate: calculateCompletionRate(goal)
      }));
    } catch (error) {
      console.error('Error fetching user goals:', error);
      throw error;
    }
  },

  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    try {
      const authUser = localStorage.getItem('auth_user');
      if (!authUser) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(authUser);

      const response = await fetch('/api/user-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...goal,
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    try {
      const response = await fetch(`/api/user-goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/user-goals/${goalId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  async addGoalProgress(goalId: string, progress: Omit<GoalProgress, 'id' | 'created_at'>): Promise<GoalProgress> {
    try {
      const response = await fetch('/api/goal-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...progress,
          goalId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add goal progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding goal progress:', error);
      throw error;
    }
  }
};