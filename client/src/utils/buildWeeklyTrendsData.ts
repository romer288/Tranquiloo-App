export interface WeeklyTrendData {
  day: string;
  displayLabel: string; // Just the day name for display
  date: string;         // The actual date
  workCareer: number;
  social: number;
  health: number;
  financial: number;
  relationships: number;
  future: number;
  family: number;
}

export function buildWeeklyTrendsData(analyses: any[] = []): WeeklyTrendData[] {
  // Safe guard against invalid input
  if (!Array.isArray(analyses) || analyses.length === 0) {
    console.log('🔍 buildWeeklyTrendsData - No valid analyses data:', analyses);
    return [] as WeeklyTrendData[];
  }
  
  console.log('🔍 buildWeeklyTrendsData - Processing weekly trends with analyses:', analyses.length);
  console.log('🔍 First analysis data structure:', analyses[0]);
  
  // Group analyses by week (Monday to Sunday)
  const weeklyData: Record<string, Record<string, { total: number; count: number }>> = {};
  
  // Helper function to get the Monday of the week for a given date
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Helper function to format week range
  const formatWeekRange = (weekStart: Date): string => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const endDay = weekEnd.getDate();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  };
  
  analyses.forEach(analysis => {
    // Safe guard against malformed analysis data
    if (!analysis || typeof analysis !== 'object') {
      console.warn('Skipping malformed analysis:', analysis);
      return;
    }
    
    const date = new Date(analysis.created_at || analysis.createdAt || new Date());
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0]; // Use ISO date as key
    const anxietyLevel = analysis.anxietyLevel || analysis.anxiety_level || 0;
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        workCareer: { total: 0, count: 0 },
        social: { total: 0, count: 0 },
        health: { total: 0, count: 0 },
        financial: { total: 0, count: 0 },
        relationships: { total: 0, count: 0 },
        future: { total: 0, count: 0 },
        family: { total: 0, count: 0 }
      };
    }
    
    console.log('🔄 Processing analysis:', {
      date: analysis.created_at,
      weekKey,
      anxietyLevel,
      triggers: analysis.triggers
    });
    
    const triggersRaw = analysis.triggers || analysis.anxiety_triggers || [];
    const triggers = Array.isArray(triggersRaw) 
      ? triggersRaw 
      : typeof triggersRaw === 'string' 
        ? triggersRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
        
    if (triggers.length === 0) {
      // If no triggers, add to general category based on anxiety level
      weeklyData[weekKey].social.total += anxietyLevel;
      weeklyData[weekKey].social.count += 1;
    } else {
      triggers.forEach((trigger: string) => {
        const lowerTrigger = trigger.toLowerCase();
        if (lowerTrigger.includes('work') || lowerTrigger.includes('career') || lowerTrigger.includes('job')) {
          weeklyData[weekKey].workCareer.total += anxietyLevel;
          weeklyData[weekKey].workCareer.count += 1;
        } else if (lowerTrigger.includes('social') || lowerTrigger.includes('people')) {
          weeklyData[weekKey].social.total += anxietyLevel;
          weeklyData[weekKey].social.count += 1;
        } else if (lowerTrigger.includes('health') || lowerTrigger.includes('medical')) {
          weeklyData[weekKey].health.total += anxietyLevel;
          weeklyData[weekKey].health.count += 1;
        } else if (lowerTrigger.includes('financial') || lowerTrigger.includes('money')) {
          weeklyData[weekKey].financial.total += anxietyLevel;
          weeklyData[weekKey].financial.count += 1;
        } else if (lowerTrigger.includes('relationship') || lowerTrigger.includes('family')) {
          if (lowerTrigger.includes('family')) {
            weeklyData[weekKey].family.total += anxietyLevel;
            weeklyData[weekKey].family.count += 1;
          } else {
            weeklyData[weekKey].relationships.total += anxietyLevel;
            weeklyData[weekKey].relationships.count += 1;
          }
        } else if (lowerTrigger.includes('future') || lowerTrigger.includes('uncertainty')) {
          weeklyData[weekKey].future.total += anxietyLevel;
          weeklyData[weekKey].future.count += 1;
        } else {
          // Unmatched triggers go to social category as fallback
          weeklyData[weekKey].social.total += anxietyLevel;
          weeklyData[weekKey].social.count += 1;
        }
      });
    }
  });

  // Convert to array format, calculate averages, and sort by date
  const result = Object.entries(weeklyData)
    .map(([weekKey, data]) => {
      const weekStart = new Date(weekKey);
      const displayLabel = formatWeekRange(weekStart);
      
      return {
        day: weekKey,
        displayLabel,
        date: weekKey,
        workCareer: data.workCareer.count > 0 ? Number((data.workCareer.total / data.workCareer.count).toFixed(1)) : 0,
        social: data.social.count > 0 ? Number((data.social.total / data.social.count).toFixed(1)) : 0,
        health: data.health.count > 0 ? Number((data.health.total / data.health.count).toFixed(1)) : 0,
        financial: data.financial.count > 0 ? Number((data.financial.total / data.financial.count).toFixed(1)) : 0,
        relationships: data.relationships.count > 0 ? Number((data.relationships.total / data.relationships.count).toFixed(1)) : 0,
        future: data.future.count > 0 ? Number((data.future.total / data.future.count).toFixed(1)) : 0,
        family: data.family.count > 0 ? Number((data.family.total / data.family.count).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log('📊 Final weekly trends data with displayLabel:', result);
  console.log('📊 Result order check - first date:', result[0]?.date, 'last date:', result[result.length - 1]?.date);
  return result;
}