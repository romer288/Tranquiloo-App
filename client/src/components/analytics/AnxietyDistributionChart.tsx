import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import ChartDownloader from './ChartDownloader';
import { TrendingUp } from 'lucide-react';

interface SeverityData {
  range: string;
  count: number;
  color: string;
}

interface AnxietyDistributionChartProps {
  severityDistribution: SeverityData[];
}

const AnxietyDistributionChart: React.FC<AnxietyDistributionChartProps> = ({ severityDistribution }) => {
  const chartConfig = {
    count: {
      label: "Sessions",
    },
  };

  // Enhanced color palette with vibrant gradients - add safety check
  const enhancedData = (severityDistribution || []).filter(d => d.count > 0).map((item, index) => ({
    ...item,
    color: [
      'hsl(142 76% 36%)', // Green for low anxiety
      'hsl(47 96% 53%)',  // Yellow for mild
      'hsl(25 95% 53%)',  // Orange for moderate  
      'hsl(0 84% 60%)',   // Red for high
      'hsl(300 76% 50%)', // Purple for severe
      'hsl(262 83% 58%)', // Violet for very high
      'hsl(348 83% 47%)'  // Deep red for extreme
    ][index % 7],
    gradientColor: [
      'linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 50%))',
      'linear-gradient(135deg, hsl(47 96% 53%), hsl(47 96% 65%))',
      'linear-gradient(135deg, hsl(25 95% 53%), hsl(25 95% 65%))',
      'linear-gradient(135deg, hsl(0 84% 60%), hsl(0 84% 70%))',
      'linear-gradient(135deg, hsl(300 76% 50%), hsl(300 76% 65%))',
      'linear-gradient(135deg, hsl(262 83% 58%), hsl(262 83% 70%))',
      'linear-gradient(135deg, hsl(348 83% 47%), hsl(348 83% 60%))'
    ][index % 7]
  }));

  const total = (enhancedData ?? []).reduce((sum, item) => sum + (item.count ?? 0), 0);

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, range }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for slices < 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
        className="drop-shadow-sm"
      >
        {`${(percent !== null && percent !== undefined && !isNaN(Number(percent)) ? (Number(percent) * 100).toFixed(0) : '0')}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{data.range}</p>
          <p className="text-sm text-muted-foreground">
            Sessions: <span className="font-medium text-foreground">{data.count}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{((data?.count !== null && data?.count !== undefined && total !== null && total !== undefined && total > 0 && !isNaN(Number(data?.count))) ? ((Number(data.count) / Number(total)) * 100).toFixed(1) : '0.0')}%</span>
          </p>
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
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Anxiety Levels Distribution
            </CardTitle>
          </div>
          <ChartDownloader 
            chartData={severityDistribution}
            chartType="severity-distribution"
            fileName="Anxiety-Levels-Distribution"
          />
        </div>
      </CardHeader>
      <CardContent>
        {enhancedData.length > 0 ? (
          <div className="space-y-6">
            <ChartContainer config={chartConfig} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {enhancedData.map((entry, index) => (
                      <React.Fragment key={index}>
                        <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={entry.color} stopOpacity="1"/>
                          <stop offset="50%" stopColor={entry.color} stopOpacity="0.9"/>
                          <stop offset="100%" stopColor={entry.color} stopOpacity="0.7"/>
                        </linearGradient>
                        <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </React.Fragment>
                    ))}
                  </defs>
                  <Pie
                    data={enhancedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={140}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    animationBegin={0}
                    animationDuration={1200}
                    paddingAngle={3}
                  >
                    {enhancedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-${index})`}
                        stroke="white"
                        strokeWidth={3}
                        filter={`url(#glow-${index})`}
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                        }}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Colorful Legend with enhanced styling */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {enhancedData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30 transition-all duration-300 border border-muted/20 hover:border-muted/40">
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-white shadow-lg animate-pulse" 
                    style={{ 
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}40`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.range}</p>
                    <p className="text-xs text-muted-foreground font-medium">{item.count} sessions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <TrendingUp className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium">No severity data available yet</p>
            <p className="text-sm text-center max-w-sm mt-2">
              Start tracking your anxiety levels to see distribution patterns
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnxietyDistributionChart;