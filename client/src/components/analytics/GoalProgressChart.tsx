import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import ChartDownloader from './ChartDownloader';
import { Target, TrendingUp } from 'lucide-react';
import { Goal } from '@/types/goals';

interface GoalProgressChartProps {
  goals: Goal[];
}

const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ goals }) => {
  // Process goals to create progress data
  const processGoalData = () => {
    if (!goals || goals.length === 0) return [];

    // Create sample progress data for demonstration
    // In a real app, this would come from goal progress tracking
    const progressData = goals.slice(0, 6).map((goal, index) => {
      const startDate = new Date(goal.start_date);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate sample progress based on goal age and type
      const baseProgress = Math.min(daysSinceStart * 2, 85);
      const variation = Math.random() * 20 - 10; // -10 to +10
      const progress = Math.max(0, Math.min(100, baseProgress + variation));

      return {
        goal: goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title,
        progress: Math.round(progress),
        category: goal.category,
        color: [
          'hsl(212 100% 50%)', // Blue
          'hsl(262 83% 58%)',  // Purple  
          'hsl(142 76% 36%)',  // Green
          'hsl(25 95% 53%)',   // Orange
          'hsl(348 83% 47%)',  // Red
          'hsl(47 96% 53%)',   // Yellow
        ][index % 6],
        isActive: goal.is_active
      };
    });

    return progressData.sort((a, b) => b.progress - a.progress);
  };

  const goalData = processGoalData();

  if (!goalData || goalData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No goals to track yet</p>
              <p className="text-sm mt-2">Set some goals to see progress tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    progress: {
      label: "Progress %",
      color: "hsl(var(--primary))",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <span className="font-medium text-foreground">{data.progress}%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Category:</span>
              <span className="font-medium text-foreground capitalize">{data.category}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`font-medium ${data.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                {data.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-xl">Goal Progress Overview</CardTitle>
          </div>
          <ChartDownloader 
            chartData={goalData}
            chartType="goal-progress"
            fileName="Goal-Progress-Chart"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={goalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
              <XAxis 
                dataKey="goal" 
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]}
                className="text-xs text-muted-foreground"
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "white" }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default GoalProgressChart;