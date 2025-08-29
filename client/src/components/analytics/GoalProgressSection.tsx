import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GoalWithProgress } from '@/types/goals';
import { Target, Trophy, TrendingUp, Star, CheckCircle2 } from 'lucide-react';

interface GoalProgressSectionProps {
  goals: GoalWithProgress[];
}

const GoalProgressSection: React.FC<GoalProgressSectionProps> = ({ goals }) => {
  if (goals.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">No Goals Set Yet</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start by creating some goals to track your progress and see beautiful analytics here
          </p>
        </CardHeader>
      </Card>
    );
  }

  const getCategoryConfig = (category: string) => {
    const configs = {
      treatment: { color: 'hsl(var(--primary))', bg: 'bg-primary/10', icon: Target },
      'self-care': { color: 'hsl(142 76% 36%)', bg: 'bg-green-500/10', icon: Star },
      therapy: { color: 'hsl(262 83% 58%)', bg: 'bg-purple-500/10', icon: Trophy },
      mindfulness: { color: 'hsl(220 70% 50%)', bg: 'bg-blue-500/10', icon: CheckCircle2 },
      exercise: { color: 'hsl(25 95% 53%)', bg: 'bg-orange-500/10', icon: TrendingUp },
      social: { color: 'hsl(330 81% 60%)', bg: 'bg-pink-500/10', icon: Target },
      work: { color: 'hsl(48 96% 53%)', bg: 'bg-yellow-500/10', icon: Target },
      sleep: { color: 'hsl(173 58% 39%)', bg: 'bg-cyan-500/10', icon: Star },
      nutrition: { color: 'hsl(142 76% 36%)', bg: 'bg-emerald-500/10', icon: Target }
    };
    return configs[category as keyof typeof configs] || { 
      color: 'hsl(var(--muted-foreground))', 
      bg: 'bg-muted/10', 
      icon: Target 
    };
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.completion_rate >= 80).length;
  const averageProgress = goals.reduce((sum, goal) => sum + goal.average_score, 0) / goals.length;
  const inProgressGoals = goals.filter(goal => goal.completion_rate > 0 && goal.completion_rate < 80).length;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Goal Progress Overview
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold text-primary">{totalGoals}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{inProgressGoals}</p>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold text-purple-600">{(averageProgress !== null && averageProgress !== undefined && !isNaN(Number(averageProgress)) ? Number(averageProgress).toFixed(1) : '0.0')}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map(goal => {
            const config = getCategoryConfig(goal.category);
            const Icon = config.icon;
            const completionStatus = goal.completion_rate >= 80 ? 'completed' : 
                                   goal.completion_rate >= 50 ? 'good' : 
                                   goal.completion_rate > 0 ? 'started' : 'new';
            
            return (
              <Card key={goal.id} className="bg-gradient-to-r from-muted/30 to-background hover:from-muted/50 hover:to-muted/10 transition-all duration-200 border-l-4" 
                    style={{ borderLeftColor: config.color }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-base">{goal.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {goal.category.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant={completionStatus === 'completed' ? 'default' : 
                                   completionStatus === 'good' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {completionStatus === 'completed' ? 'Completed' :
                             completionStatus === 'good' ? 'Good Progress' :
                             completionStatus === 'started' ? 'Getting Started' : 'New Goal'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {(goal?.average_score !== null && goal?.average_score !== undefined && !isNaN(Number(goal.average_score)) ? Number(goal.average_score).toFixed(1) : '0.0')}/10
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(Number(goal.completion_rate ?? 0)).toFixed(2)}% complete
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={Number(goal.completion_rate ?? 0)} 
                      className="h-3"
                      style={{ 
                        '--progress-background': config.color + '20',
                        '--progress-foreground': config.color 
                      } as React.CSSProperties}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress: {Number(goal.completion_rate ?? 0).toFixed(0)}%</span>
                      <span>Score: {(goal?.average_score !== null && goal?.average_score !== undefined && !isNaN(Number(goal.average_score)) ? Number(goal.average_score).toFixed(1) : '0.0')}/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalProgressSection;