import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import ChartDownloader from './ChartDownloader';
import { WeeklyTrendData } from '@/utils/buildWeeklyTrendsData';
import { TrendingUp, Activity } from 'lucide-react';

interface AnxietyTrendsChartProps {
  weeklyTrends: WeeklyTrendData[];
}

const AnxietyTrendsChart: React.FC<AnxietyTrendsChartProps> = ({ weeklyTrends }) => {
  console.log('📈 AnxietyTrendsChart render - weeklyTrends:', weeklyTrends);
  
  // Safety check for data
  if (!weeklyTrends || weeklyTrends.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Anxiety Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No trend data available yet
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig = {
    workCareer: { label: 'Work/Career', color: 'hsl(var(--primary))' },
    social: { label: 'Social', color: 'hsl(var(--destructive))' },
    health: { label: 'Health', color: 'hsl(var(--accent))' },
    financial: { label: 'Financial', color: 'hsl(142 76% 36%)' },
    relationships: { label: 'Relationships', color: 'hsl(262 83% 58%)' },
    future: { label: 'Future/Uncertainty', color: 'hsl(25 95% 53%)' },
    family: { label: 'Family', color: 'hsl(173 58% 39%)' }
  };

  const CustomizedAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const dataIndex = payload.index;
    const item = weeklyTrends?.[dataIndex];
    
    if (!item || !weeklyTrends) return null;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fontSize={11} 
          fill="hsl(var(--muted-foreground))"
          transform="rotate(-12)"
          className="font-medium"
        >
          {item.displayLabel}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload
              .filter((entry: any) => entry.value > 0)
              .sort((a: any, b: any) => b.value - a.value)
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">{chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}</span>
                  </div>
                  <span className="font-medium text-foreground">{(entry?.value !== null && entry?.value !== undefined && !isNaN(Number(entry.value)) ? Number(entry.value).toFixed(1) : '0.0')}</span>
                </div>
              ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Weekly Anxiety Type Trends
            </CardTitle>
          </div>
          <ChartDownloader 
            chartData={weeklyTrends}
            chartType="weekly-anxiety-trends"
            fileName="Weekly-Anxiety-Type-Trends"
          />
        </div>
      </CardHeader>
      <CardContent>
        {weeklyTrends.length > 0 ? (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    {Object.entries(chartConfig).map(([key, config], index) => (
                      <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={config.color} stopOpacity={0.1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    className="stroke-muted/50"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="displayLabel"
                    height={80}
                    interval="preserveStartEnd"
                    tick={<CustomizedAxisTick />}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs text-muted-foreground"
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<CustomTooltip />} />
                  
                  <Line 
                    type="monotone" 
                    dataKey="workCareer" 
                    stroke={chartConfig.workCareer.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.workCareer.color, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: chartConfig.workCareer.color, strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="social" 
                    stroke={chartConfig.social.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.social.color, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: chartConfig.social.color, strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    stroke={chartConfig.health.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.health.color, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: chartConfig.health.color, strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="financial" 
                    stroke={chartConfig.financial.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.financial.color, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: chartConfig.financial.color, strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="relationships" 
                    stroke={chartConfig.relationships.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.relationships.color, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: chartConfig.relationships.color, strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="future" 
                    stroke={chartConfig.future.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.future.color, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: chartConfig.future.color, strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="family" 
                    stroke={chartConfig.family.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.family.color, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: chartConfig.family.color, strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(chartConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs font-medium text-foreground truncate">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Activity className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium">No trend data available yet</p>
            <p className="text-sm text-center max-w-sm mt-2">
              Start tracking different types of anxiety to see weekly trends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnxietyTrendsChart;