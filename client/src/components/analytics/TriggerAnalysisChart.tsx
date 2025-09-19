import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import ChartDownloader from './ChartDownloader';
import { Target, Brain } from 'lucide-react';

interface TriggerAnalysisData {
  trigger: string;
  count: number;
  avgSeverity: number;
  color: string;
}

interface TriggerAnalysisChartProps {
  analyses: any[];
}

const TriggerAnalysisChart: React.FC<TriggerAnalysisChartProps> = ({ analyses }) => {
  // Process analyses to extract trigger data for chart
  const processAnalyses = () => {
    if (!analyses || analyses.length === 0) return [];

    const triggerMap: Record<string, { total: number; count: number; severities: number[] }> = {};

    analyses.forEach(analysis => {
      const triggers = analysis.triggers || [];
      const severity = analysis.anxietyLevel || 0;

      triggers.forEach((trigger: string) => {
        const cleanTrigger = trigger.toLowerCase().trim();
        
        if (!triggerMap[cleanTrigger]) {
          triggerMap[cleanTrigger] = { total: 0, count: 0, severities: [] };
        }
        
        triggerMap[cleanTrigger].total += severity;
        triggerMap[cleanTrigger].count += 1;
        triggerMap[cleanTrigger].severities.push(severity);
      });
    });

    // Convert to chart data format
    const triggerData = Object.entries(triggerMap)
      .map(([trigger, data], index) => ({
        trigger: trigger.charAt(0).toUpperCase() + trigger.slice(1),
        count: data.count,
        avgSeverity: Math.round((data.total / data.count) * 10) / 10,
        color: [
          'hsl(212 100% 50%)', // Blue
          'hsl(262 83% 58%)',  // Purple
          'hsl(142 76% 36%)',  // Green
          'hsl(25 95% 53%)',   // Orange
          'hsl(348 83% 47%)',  // Red
          'hsl(47 96% 53%)',   // Yellow
          'hsl(173 58% 39%)',  // Teal
          'hsl(300 76% 50%)',  // Magenta
        ][index % 8]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 triggers

    return triggerData;
  };

  const triggerData = processAnalyses();

  if (!triggerData || triggerData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Anxiety Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No trigger data available yet</p>
              <p className="text-sm mt-2">Start tracking anxiety to see trigger patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    count: {
      label: "Occurrences",
      color: "hsl(var(--primary))",
    },
    avgSeverity: {
      label: "Avg Severity",
      color: "hsl(var(--destructive))",
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
              <span className="text-sm text-muted-foreground">Occurrences:</span>
              <span className="font-medium text-foreground">{data.count}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Avg Severity:</span>
              <span className="font-medium text-foreground">{data.avgSeverity}/10</span>
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
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Top Anxiety Triggers</CardTitle>
          </div>
          <ChartDownloader 
            chartData={triggerData}
            chartType="trigger-analysis"
            fileName="Trigger-Analysis-Chart"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={triggerData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
              <XAxis 
                dataKey="trigger" 
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs text-muted-foreground"
              />
              <YAxis className="text-xs text-muted-foreground" />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TriggerAnalysisChart;