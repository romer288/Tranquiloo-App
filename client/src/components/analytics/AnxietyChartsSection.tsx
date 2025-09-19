import React from 'react';
import AnxietyTrendsChart from './AnxietyTrendsChart';
import AnxietyDistributionChart from './AnxietyDistributionChart';
import { buildWeeklyTrendsData } from '@/utils/buildWeeklyTrendsData';

interface TriggerData {
  trigger: string;
  count: number;
  avgSeverity: number;
  color: string;
}

interface SeverityData {
  range: string;
  count: number;
  color: string;
}

interface AnxietyChartsSectionProps {
  triggerData: TriggerData[];
  severityDistribution: SeverityData[];
  analyses: any[];
  showOnly?: 'trends' | 'distribution' | 'all';
}

const AnxietyChartsSection: React.FC<AnxietyChartsSectionProps> = ({
  triggerData,
  severityDistribution,
  analyses,
  showOnly = 'all'
}) => {
  console.log('🚀 AnxietyChartsSection render - Received analyses:', analyses.length);
  console.log('First few analyses:', (analyses ?? []).slice(0, 3));
  console.log('🚀 showOnly:', showOnly);
  console.log('🚀 COMPONENT LOCATION CHECK:', new Error().stack?.split('\n')[2]);
  console.log('🚀 FIRST ANALYSIS USER_ID:', analyses[0]?.user_id);
  console.log('ALL UNIQUE USER_IDS:', [...new Set((analyses ?? []).map(a => a.user_id))]);
  
  const weeklyTrends = React.useMemo(
    () => buildWeeklyTrendsData(analyses),
    [analyses]
  );

  // When only showing one chart, return it directly without extra wrapper
  if (showOnly === 'trends') {
    return <AnxietyTrendsChart weeklyTrends={weeklyTrends} />;
  }

  if (showOnly === 'distribution') {
    return <AnxietyDistributionChart severityDistribution={severityDistribution} />;
  }

  // Original behavior for 'all' - show both charts
  return (
    <div className="space-y-8 mb-8">
      {/* Anxiety Type Trends Chart */}
      <AnxietyTrendsChart weeklyTrends={weeklyTrends} />

      {/* Severity Distribution */}
      <AnxietyDistributionChart severityDistribution={severityDistribution} />
    </div>
  );
};

export default AnxietyChartsSection;