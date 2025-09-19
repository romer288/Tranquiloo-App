
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';

interface TriggerData {
  trigger: string;
  count: number;
  avgSeverity: number;
  color: string;
}

interface AnalyticsMetricsProps {
  totalEntries: number;
  averageAnxiety: number;
  mostCommonTrigger: TriggerData | { trigger: string; count: number };
}

const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({
  totalEntries,
  averageAnxiety,
  mostCommonTrigger
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Anxiety</p>
            <p className="text-2xl font-bold text-gray-900">{(averageAnxiety !== null && averageAnxiety !== undefined && !isNaN(Number(averageAnxiety)) ? Number(averageAnxiety).toFixed(1) : '0.0')}/10</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Most Common Trigger</p>
            <p className="text-lg font-bold text-gray-900">{mostCommonTrigger?.trigger || 'No triggers recorded'}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <Target className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Treatment Progress</p>
            <p className="text-lg font-bold text-green-700">Improving</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <TrendingDown className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsMetrics;
