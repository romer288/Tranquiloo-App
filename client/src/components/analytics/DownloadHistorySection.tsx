import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, TrendingUp, Calendar, HardDrive, Activity, BarChart3, Archive } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import ChartDownloader from './ChartDownloader';

interface DownloadEvent {
  date: string;
  type: string;
  description: string;
  fileSize: string;
  category: 'analytics' | 'reports' | 'summaries' | 'exports';
}

interface DownloadHistorySectionProps {
  downloadEvents: DownloadEvent[];
}

const DownloadHistorySection: React.FC<DownloadHistorySectionProps> = ({ downloadEvents }) => {
  const chartData = useMemo(() => {
    // Group downloads by week for trends
    const weeklyData = downloadEvents.reduce((acc, event) => {
      const date = new Date(event.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = { 
          week: weekKey, 
          downloads: 0, 
          totalSize: 0,
          analytics: 0,
          reports: 0,
          summaries: 0,
          exports: 0
        };
      }
      
      acc[weekKey].downloads += 1;
      acc[weekKey].totalSize += parseFloat(event.fileSize);
      acc[weekKey][event.category] += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(weeklyData).sort((a: any, b: any) => 
      new Date(a.week).getTime() - new Date(b.week).getTime()
    ).slice(-8); // Last 8 weeks
  }, [downloadEvents]);

  const categoryData = useMemo(() => {
    const categories = downloadEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      analytics: 'hsl(var(--primary))',
      reports: 'hsl(var(--secondary))',
      summaries: 'hsl(var(--accent))',
      exports: 'hsl(var(--muted))'
    };

    return Object.entries(categories).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: colors[category as keyof typeof colors]
    }));
  }, [downloadEvents]);

  const totalSize = downloadEvents.reduce((sum, event) => sum + parseFloat(event.fileSize), 0);
  const thisWeekDownloads = downloadEvents.filter(event => {
    const eventDate = new Date(event.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return eventDate > weekAgo;
  }).length;

  const chartConfig = {
    downloads: {
      label: "Downloads",
      color: "hsl(var(--primary))",
    },
    totalSize: {
      label: "Total Size (MB)",
      color: "hsl(var(--secondary))",
    },
    analytics: {
      label: "Analytics",
      color: "hsl(var(--primary))",
    },
    reports: {
      label: "Reports", 
      color: "hsl(var(--secondary))",
    },
    summaries: {
      label: "Summaries",
      color: "hsl(var(--accent))",
    },
    exports: {
      label: "Exports",
      color: "hsl(var(--muted-foreground))",
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'reports': return <FileText className="w-4 h-4" />;
      case 'summaries': return <Activity className="w-4 h-4" />;
      case 'exports': return <Archive className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'default';
      case 'reports': return 'secondary'; 
      case 'summaries': return 'outline';
      case 'exports': return 'destructive';
      default: return 'default';
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'bg-blue-500/10 border-blue-500/20';
      case 'reports': return 'bg-green-500/10 border-green-500/20';
      case 'summaries': return 'bg-orange-500/10 border-orange-500/20';
      case 'exports': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  if (downloadEvents.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-4 border border-primary/20">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            No Download History Yet
          </CardTitle>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your download activity will appear here once you start exporting reports, charts, and analytics data. Each download will be tracked with detailed insights.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600/80 uppercase tracking-wider">Total Downloads</p>
                <p className="text-2xl font-bold text-blue-600">{downloadEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center ring-2 ring-blue-500/20">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-600/80 uppercase tracking-wider">Total Data</p>
                <p className="text-2xl font-bold text-green-600">{(totalSize !== null && totalSize !== undefined && !isNaN(Number(totalSize)) ? Number(totalSize).toFixed(1) : '0.0')} MB</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center ring-2 ring-green-500/20">
                <HardDrive className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-600/80 uppercase tracking-wider">This Week</p>
                <p className="text-2xl font-bold text-orange-600">{thisWeekDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center ring-2 ring-orange-500/20">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-600/80 uppercase tracking-wider">Avg Size</p>
                <p className="text-2xl font-bold text-purple-600">{downloadEvents.length > 0 && totalSize !== null && totalSize !== undefined && !isNaN(Number(totalSize)) ? (Number(totalSize) / downloadEvents.length).toFixed(1) : '0.0'} MB</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center ring-2 ring-purple-500/20">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Download Trends with Area Chart */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold text-gray-900">Download Activity Trends</CardTitle>
            <ChartDownloader 
              chartData={chartData} 
              chartType="weekly-downloads" 
              fileName="download-activity-trends" 
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220 100% 60%)" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="hsl(280 100% 60%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(320 100% 60%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis 
                    dataKey="week"
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    className="text-xs text-gray-600"
                  />
                  <YAxis className="text-xs text-gray-600" />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-xl p-3">
                            <p className="font-bold text-gray-900">{new Date(label).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">
                              Downloads: <span className="font-bold text-blue-600">{payload[0].value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="downloads" 
                    stroke="hsl(220 100% 50%)"
                    strokeWidth={3}
                    fill="url(#downloadGradient)"
                    dot={{ fill: 'hsl(220 100% 50%)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: 'hsl(220 100% 50%)', strokeWidth: 2, fill: "white" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        {/* Enhanced Category Distribution */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-secondary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold text-gray-900">Download Categories</CardTitle>
            <ChartDownloader 
              chartData={categoryData} 
              chartType="category-distribution" 
              fileName="download-categories" 
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {categoryData.map((entry, index) => (
                      <linearGradient key={index} id={`categoryGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={entry.color} stopOpacity="1"/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity="0.7"/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#categoryGradient-${index})`}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-xl p-3">
                            <p className="font-bold text-gray-900">{data.name}</p>
                            <p className="text-sm text-gray-600">
                              Count: <span className="font-bold text-blue-600">{data.value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      {/* Enhanced Recent Downloads List */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-muted/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Download Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {downloadEvents.slice(0, 10).map((event, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-xl border-2 ${getCategoryBgColor(event.category)} hover:border-opacity-60 transition-all duration-200 hover:shadow-md`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center border border-white/80 shadow-sm">
                    {getCategoryIcon(event.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{event.type}</p>
                      <Badge variant={getCategoryColor(event.category) as any} className="text-xs font-medium">
                        {event.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{event.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-gray-900">{event.fileSize}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadHistorySection;