import { ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';

export interface TriggerData {
  trigger: string;
  count: number;
  avgSeverity: number;
  color: string;
  category: string;
  description: string;
  whyExplanation: string;
  relatedTriggers?: string[];
}

export interface SeverityDistribution {
  range: string;
  count: number;
  color: string;
}

// Trigger categorization and descriptions
const getTriggerMetadata = (trigger: string, analyses: ClaudeAnxietyAnalysis[], categoryData: any) => {
  const lowerTrigger = trigger.toLowerCase();
  const { count, avgSeverity, relatedTriggers } = categoryData;
  
  // Analyze patterns in the client's responses for deeper insights
  const getClientPatterns = () => {
    const relevantAnalyses = analyses.filter(analysis => 
      analysis.triggers.some(t => t.toLowerCase().includes(lowerTrigger.split(' ')[0]))
    );
    
    const cognitiveDistortions = relevantAnalyses.flatMap(a => a.cognitiveDistortions || []);
    const escalationPattern = relevantAnalyses.filter(a => a.escalationDetected).length;
    const crisisLevels = relevantAnalyses.map(a => a.crisisRiskLevel).filter(Boolean);
    const sentiments = relevantAnalyses.map(a => a.sentiment).filter(Boolean);
    
    return { cognitiveDistortions, escalationPattern, crisisLevels, sentiments, relevantAnalyses };
  };
  
  const patterns = getClientPatterns();
  
  if (lowerTrigger.includes('social') || lowerTrigger.includes('people') || lowerTrigger.includes('attractive') || lowerTrigger.includes('judgment') || lowerTrigger.includes('interaction')) {
    const socialPatterns = patterns.relevantAnalyses.map(a => ({
      triggers: a.triggers,
      personalizedResponse: a.personalizedResponse,
      dsm5Indicators: a.dsm5Indicators || []
    }));
    
    const underlyingFactors = [];
    if (relatedTriggers.some(t => t.includes('attractive'))) underlyingFactors.push('romantic/sexual anxiety');
    if (relatedTriggers.some(t => t.includes('judgment'))) underlyingFactors.push('fear of negative evaluation');
    if (relatedTriggers.some(t => t.includes('interaction'))) underlyingFactors.push('interpersonal anxiety');
    if (patterns.cognitiveDistortions.includes('All-or-nothing thinking')) underlyingFactors.push('perfectionist thinking patterns');
    
    return {
      category: 'Social Anxiety',
      description: 'Anxiety related to social situations, interactions with others, or fear of judgment',
      whyExplanation: `CLINICAL INSIGHT: Client presents with social anxiety triggers occurring ${count} times (severity avg: ${avgSeverity.toFixed(1)}/10). 

UNDERLYING PSYCHOLOGICAL FACTORS:
• ${underlyingFactors.length > 0 ? underlyingFactors.join(', ') : 'General social apprehension'}
• Cognitive distortions present: ${patterns.cognitiveDistortions.length > 0 ? patterns.cognitiveDistortions.slice(0,2).join(', ') : 'None identified'}
• Escalation pattern: ${patterns.escalationPattern}/${count} conversations showed escalation

SPECIFIC MANIFESTATIONS:
• Primary triggers: ${relatedTriggers.slice(0, 3).join(', ')}
• DSM-5 related indicators: ${socialPatterns.flatMap(p => p.dsm5Indicators).slice(0,3).join(', ') || 'Not specified'}

THERAPEUTIC IMPLICATIONS: ${
  avgSeverity >= 7 ? 'High severity suggests possible social anxiety disorder. Consider CBT with exposure therapy.' :
  avgSeverity >= 5 ? 'Moderate severity indicates significant impairment. Social skills training recommended.' :
  'Mild severity suggests situational anxiety. Coping strategies may suffice.'
}`
    };
  }
  
  if (lowerTrigger.includes('work') || lowerTrigger.includes('job') || lowerTrigger.includes('career') || lowerTrigger.includes('academic') || lowerTrigger.includes('employment')) {
    const workFactors = [];
    if (relatedTriggers.some(t => t.includes('performance'))) workFactors.push('performance anxiety');
    if (relatedTriggers.some(t => t.includes('failure'))) workFactors.push('fear of failure');
    if (relatedTriggers.some(t => t.includes('pressure'))) workFactors.push('external pressure sensitivity');
    if (relatedTriggers.some(t => t.includes('immigration'))) workFactors.push('immigration-related stress');
    
    return {
      category: 'Work/Academic Stress',
      description: 'Anxiety related to work performance, job security, or academic pressures',
      whyExplanation: `CLINICAL INSIGHT: Work/academic anxiety pattern identified across ${count} conversations (severity avg: ${avgSeverity.toFixed(1)}/10).

PSYCHOLOGICAL PROFILE:
• Core fears: ${workFactors.length > 0 ? workFactors.join(', ') : 'Achievement-related anxiety'}
• Cognitive patterns: ${patterns.cognitiveDistortions.includes('Should statements') ? 'Perfectionist "should" statements detected' : 'Standard performance expectations'}
• Crisis risk: ${patterns.crisisLevels.includes('high') ? 'Elevated during peak stress' : 'Generally manageable'}

SPECIFIC STRESSORS: ${relatedTriggers.slice(0, 3).join(', ')}

CLINICAL CONSIDERATIONS: ${
  avgSeverity >= 7 ? 'Severe work anxiety may indicate burnout or adjustment disorder. Workplace accommodations may be needed.' :
  avgSeverity >= 5 ? 'Moderate anxiety affecting performance. Stress management and cognitive restructuring recommended.' :
  'Manageable work stress. Time management and coping skills focus.'
}`
    };
  }
  
  if (lowerTrigger.includes('health') || lowerTrigger.includes('medical') || lowerTrigger.includes('sick') || lowerTrigger.includes('physical')) {
    return {
      category: 'Health Concerns',
      description: 'Anxiety related to physical health, medical issues, or bodily sensations',
      whyExplanation: `You have this trigger because health-related concerns cause you ${
        avgSeverity >= 7 ? 'high anxiety' : avgSeverity >= 5 ? 'moderate anxiety' : 'some anxiety'
      } (avg ${avgSeverity.toFixed(1)}/10). This came up ${count} times in conversations about ${relatedTriggers.slice(0, 2).join(' and ')}.`
    };
  }
  
  if (lowerTrigger.includes('financial') || lowerTrigger.includes('money') || lowerTrigger.includes('bills') || lowerTrigger.includes('unemployment')) {
    return {
      category: 'Financial Stress',
      description: 'Anxiety related to money, financial security, or economic pressures',
      whyExplanation: `CLINICAL INSIGHT: Financial anxiety documented ${count} times (severity avg: ${avgSeverity.toFixed(1)}/10).

UNDERLYING CONCERNS: ${relatedTriggers.includes('unemployment') ? 'Job insecurity and economic instability' : 'Financial management and security fears'}
FAMILY DYNAMICS: ${relatedTriggers.some(t => t.includes('family')) ? 'Family financial responsibility burden identified' : 'Individual financial concerns'}
COGNITIVE PATTERNS: ${patterns.cognitiveDistortions.includes('Catastrophizing') ? 'Catastrophic thinking about financial outcomes' : 'Reality-based financial concerns'}

THERAPEUTIC FOCUS: Financial anxiety often masks deeper control and security needs. Consider exploring attachment patterns and family-of-origin financial messages.`
    };
  }
  
  if (lowerTrigger.includes('family') || lowerTrigger.includes('relationship') || lowerTrigger.includes('parent') || lowerTrigger.includes('partner')) {
    return {
      category: 'Relationships',
      description: 'Anxiety related to family dynamics, romantic relationships, or interpersonal conflicts',
      whyExplanation: `CLINICAL INSIGHT: Relationship anxiety pattern across ${count} conversations (severity avg: ${avgSeverity.toFixed(1)}/10).

ATTACHMENT CONSIDERATIONS: ${
  relatedTriggers.some(t => t.includes('family')) ? 'Family-of-origin dynamics affecting current relationships' :
  'Interpersonal boundary and intimacy concerns'
}
COMMUNICATION PATTERNS: ${relatedTriggers.some(t => t.includes('misunderstood')) ? 'Feeling misunderstood suggests communication style mismatches' : 'Standard relationship navigation'}

THERAPEUTIC DIRECTION: Explore attachment style, family dynamics, and communication patterns. Consider couples/family therapy if appropriate.`
    };
  }
  
  if (lowerTrigger.includes('future') || lowerTrigger.includes('uncertainty') || lowerTrigger.includes('unknown') || lowerTrigger.includes('fear of')) {
    return {
      category: 'Future/Uncertainty',
      description: 'Anxiety related to future events, uncertainty, or fear of the unknown',
      whyExplanation: `CLINICAL INSIGHT: Uncertainty intolerance documented ${count} times (severity avg: ${avgSeverity.toFixed(1)}/10).

PSYCHOLOGICAL PROFILE: ${
  patterns.cognitiveDistortions.includes('Catastrophizing') ? 'Catastrophic thinking patterns about future outcomes' :
  'General intolerance of uncertainty and ambiguity'
}
CONTROL ISSUES: Client appears to have high need for predictability and control over outcomes.

THERAPEUTIC APPROACH: Focus on uncertainty tolerance training, mindfulness-based interventions, and cognitive restructuring around control beliefs.`
    };
  }
  
  return {
    category: 'General Anxiety',
    description: 'General anxiety triggers that don\'t fit into specific categories',
    whyExplanation: `CLINICAL INSIGHT: Non-specific anxiety pattern across ${count} conversations (severity avg: ${avgSeverity.toFixed(1)}/10).

REQUIRES FURTHER ASSESSMENT: These triggers need deeper exploration to identify underlying themes and patterns. Consider structured clinical interview to clarify specific anxiety subtypes.

IMMEDIATE FOCUS: General anxiety management and trigger identification exercises recommended.`
  };
};

export const processTriggerData = (analyses: ClaudeAnxietyAnalysis[]): TriggerData[] => {
  if (!analyses || analyses.length === 0) return [];
  
  const triggerCounts: Record<string, { count: number; severitySum: number; relatedTriggers: Set<string> }> = {};
  const colors = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#06B6D4'];

  // First pass: collect all triggers and group by category
  analyses.forEach(analysis => {
    if (analysis && analysis.triggers) {
      analysis.triggers.forEach(trigger => {
        // Get basic metadata for categorization
        const basicMetadata = getTriggerMetadata(trigger, [], { count: 0, avgSeverity: 0, relatedTriggers: [] });
        const category = basicMetadata.category;
        
        if (!triggerCounts[category]) {
          triggerCounts[category] = { 
            count: 0, 
            severitySum: 0, 
            relatedTriggers: new Set()
          };
        }
        triggerCounts[category].count++;
        triggerCounts[category].severitySum += analysis.anxietyLevel;
        triggerCounts[category].relatedTriggers.add(trigger);
      });
    }
  });

  return Object.entries(triggerCounts).map(([category, data], index) => {
    const categoryData = { count: data.count, avgSeverity: data.count > 0 ? data.severitySum / data.count : 0, relatedTriggers: Array.from(data.relatedTriggers) };
    const metadata = getTriggerMetadata(category, analyses, categoryData);
    return {
      trigger: category,
      count: data.count,
      avgSeverity: categoryData.avgSeverity,
      color: colors[index % colors.length],
      category: metadata.category,
      description: metadata.description,
      whyExplanation: metadata.whyExplanation,
      relatedTriggers: categoryData.relatedTriggers
    };
  });
};

export const processSeverityDistribution = (analyses: ClaudeAnxietyAnalysis[]): SeverityDistribution[] => {
  if (!analyses || analyses.length === 0) return [];
  
  const distribution = { low: 0, moderate: 0, high: 0, severe: 0 };
  
  analyses.forEach(analysis => {
    if (!analysis || typeof analysis.anxietyLevel !== 'number') return;
    if (analysis.anxietyLevel <= 3) distribution.low++;
    else if (analysis.anxietyLevel <= 6) distribution.moderate++;
    else if (analysis.anxietyLevel <= 8) distribution.high++;
    else distribution.severe++;
  });

  return [
    { range: '1-3 (Low)', count: distribution.low, color: '#10B981' },
    { range: '4-6 (Moderate)', count: distribution.moderate, color: '#F59E0B' },
    { range: '7-8 (High)', count: distribution.high, color: '#EF4444' },
    { range: '9-10 (Severe)', count: distribution.severe, color: '#DC2626' }
  ];
};

export const getAnalyticsMetrics = (analyses: ClaudeAnxietyAnalysis[], triggerData: TriggerData[], goalProgress?: any[]) => {
  const totalEntries = analyses ? analyses.length : 0;
  const averageAnxiety = analyses && analyses.length > 0 
    ? analyses.reduce((sum, analysis) => sum + (analysis?.anxietyLevel || 0), 0) / analyses.length
    : 0;
  const mostCommonTrigger = triggerData.length > 0 
    ? triggerData.reduce((prev, current) => (prev.count > current.count) ? prev : current)
    : { trigger: 'No data yet', count: 0 };

  // Calculate goal progress metrics
  const goalMetrics = goalProgress && goalProgress.length > 0 ? {
    totalGoals: goalProgress.length,
    averageProgress: goalProgress.reduce((sum, goal) => sum + (goal.average_score || 0), 0) / goalProgress.length,
    completedGoals: goalProgress.filter(goal => (goal.completion_rate || 0) >= 80).length
  } : {
    totalGoals: 0,
    averageProgress: 0,
    completedGoals: 0
  };

  return {
    totalEntries,
    averageAnxiety,
    mostCommonTrigger,
    goalMetrics
  };
};