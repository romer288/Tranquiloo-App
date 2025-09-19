import { InterventionSummary } from '@/types/goals';
import { GoalWithProgress } from '@/types/goals';
import { ClaudeAnxietyAnalysisWithDate } from '@/services/analyticsService';
import { processTriggerData, TriggerData } from '@/utils/analyticsDataProcessor';

export const generateSummaryReport = (
  summaries: InterventionSummary[],
  goals: GoalWithProgress[],
  analyses?: ClaudeAnxietyAnalysisWithDate[]
): string => {
  const today = new Date().toLocaleDateString();
  
  // Calculate comprehensive statistics
  const totalAnalyses = analyses?.length || 0;
  const totalConversations = summaries.reduce((sum, s) => sum + s.conversation_count, 0);
  const avgAnxiety = analyses && analyses.length > 0 
    ? analyses.reduce((sum, a) => sum + a.anxietyLevel, 0) / analyses.length 
    : 0;
  const highAnxietySessions = analyses?.filter(a => a.anxietyLevel >= 7).length || 0;
  const crisisRiskSessions = analyses?.filter(a => a.crisisRiskLevel === 'high').length || 0;
  const escalationCount = analyses?.filter(a => a.escalationDetected).length || 0;
  
  let report = `COMPREHENSIVE MENTAL HEALTH REPORT
Generated on: ${today}

==================================================
EXECUTIVE SUMMARY
==================================================

This comprehensive report provides detailed insights into your mental health journey, 
conversation patterns, and therapeutic progress. The analysis combines behavioral data, 
anxiety assessments, and goal tracking to present a holistic view of your wellbeing.

REPORT HIGHLIGHTS:
• Total therapy sessions analyzed: ${totalAnalyses}
• Average anxiety level: ${(avgAnxiety !== null && avgAnxiety !== undefined && !isNaN(Number(avgAnxiety)) ? Number(avgAnxiety).toFixed(1) : '0.0')}/10
• High-intensity sessions (7+ anxiety): ${highAnxietySessions}
• Crisis risk interventions: ${crisisRiskSessions}
• Weekly intervention summaries: ${summaries.length}
• Active treatment goals: ${goals?.length || 0}

OVERALL ASSESSMENT: ${avgAnxiety < 4 ? 'EXCELLENT PROGRESS' : 
                     avgAnxiety < 6 ? 'GOOD STABILITY' : 
                     avgAnxiety < 8 ? 'MODERATE CONCERNS' : 'REQUIRES ATTENTION'}

==================================================
`;

  if (summaries.length === 0 && totalAnalyses === 0) {
    report += `

GETTING STARTED
===============

No intervention data available yet. Here's how to begin:

✓ Start regular conversations to generate weekly summaries
✓ Complete anxiety assessments for detailed analysis  
✓ Set therapeutic goals to track progress
✓ Engage with interventions consistently

Your mental health journey starts with consistent engagement.

==================================================
`;
    return report;
  }

  // Sort all summaries by week_start date (newest first)
  const sortedSummaries = [...summaries].sort((a, b) => 
    new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
  );

  // Enhanced overview with clinical insights
  report += `

CLINICAL OVERVIEW & ANALYTICS
=============================

ENGAGEMENT METRICS:
• Total Weekly Summaries: ${summaries.length}
• Total Conversations: ${totalConversations}
• Analysis Period: ${sortedSummaries.length > 0 ? 
    `${sortedSummaries[sortedSummaries.length - 1].week_start} to ${sortedSummaries[0].week_end}` : 'N/A'}
• Session Consistency: ${totalAnalyses > 0 ? 'ACTIVE' : 'INACTIVE'}

ANXIETY PROFILE:
• Baseline Anxiety Level: ${(avgAnxiety !== null && avgAnxiety !== undefined && !isNaN(Number(avgAnxiety)) ? Number(avgAnxiety).toFixed(1) : '0.0')}/10
• High-Intensity Sessions: ${highAnxietySessions} (${totalAnalyses > 0 ? Math.round((highAnxietySessions/totalAnalyses)*100) : 0}%)
• Crisis Interventions: ${crisisRiskSessions}
• Escalation Events: ${escalationCount}

THERAPEUTIC PROGRESS:
• Goals Set: ${goals?.length || 0}
• Goals Completed: ${goals?.filter(g => (g.completion_rate || 0) >= 90).length || 0}
• Average Goal Progress: ${goals && goals.length > 0 ? 
    Math.round(goals.reduce((sum, g) => sum + (g.completion_rate || 0), 0) / goals.length) : 0}%

==================================================

DETAILED WEEKLY INTERVENTION ANALYSIS
=====================================

`;

  // Group by week and show all interventions for each week
  const weekGroups = sortedSummaries.reduce((acc, summary) => {
    const weekKey = `${summary.week_start}_${summary.week_end}`;
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(summary);
    return acc;
  }, {} as Record<string, InterventionSummary[]>);

  // Add each week section with enhanced clinical insights
  for (const [weekKey, weekSummaries] of Object.entries(weekGroups)) {
    const [weekStart, weekEnd] = weekKey.split('_');
    const weekNum = Object.keys(weekGroups).indexOf(weekKey) + 1;
    
    report += `
🗓️ WEEK ${weekNum}: ${weekStart} to ${weekEnd}
${'='.repeat(50)}

`;

    // Get analyses for this week to provide clinical insights
    if (analyses && analyses.length > 0) {
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekEnd);
      const weekAnalyses = analyses.filter(analysis => {
        const analysisDate = new Date(analysis.created_at);
        return analysisDate >= weekStartDate && analysisDate <= weekEndDate;
      });

      if (weekAnalyses.length > 0) {
        const triggerData = processTriggerData(weekAnalyses);
        const weekAvgAnxiety = weekAnalyses.reduce((sum, a) => sum + a.anxietyLevel, 0) / weekAnalyses.length;
        const weekHighAnxiety = weekAnalyses.filter(a => a.anxietyLevel >= 7).length;
        const weekEscalations = weekAnalyses.filter(a => a.escalationDetected).length;
        const weekCrisis = weekAnalyses.filter(a => a.crisisRiskLevel === 'high').length;
        
        // Determine week status
        const weekStatus = weekAvgAnxiety < 4 ? '🟢 STABLE' : 
                          weekAvgAnxiety < 6 ? '🟡 MODERATE' : 
                          weekAvgAnxiety < 8 ? '🟠 ELEVATED' : '🔴 HIGH CONCERN';
        
        report += `📊 WEEKLY CLINICAL SUMMARY
${'-'.repeat(40)}

WEEK STATUS: ${weekStatus}

KEY METRICS:
• Total Sessions: ${weekAnalyses.length}
• Average Anxiety: ${(weekAvgAnxiety !== null && weekAvgAnxiety !== undefined && !isNaN(Number(weekAvgAnxiety)) ? Number(weekAvgAnxiety).toFixed(1) : '0.0')}/10
• High-Intensity Sessions: ${weekHighAnxiety} (${Math.round((weekHighAnxiety/weekAnalyses.length)*100)}%)
• Escalation Events: ${weekEscalations}
• Crisis Risk Sessions: ${weekCrisis}

IMPROVEMENT INDICATORS:
• Session Frequency: ${weekAnalyses.length >= 3 ? '✅ Excellent' : weekAnalyses.length >= 2 ? '⚠️ Good' : '❌ Needs Improvement'}
• Anxiety Management: ${weekAvgAnxiety < 5 ? '✅ Excellent' : weekAvgAnxiety < 7 ? '⚠️ Fair' : '❌ Concerning'}
• Crisis Prevention: ${weekCrisis === 0 ? '✅ Effective' : '❌ Attention Needed'}

🎯 TRIGGER ANALYSIS FOR THIS WEEK:
${'-'.repeat(40)}

`;
        
        if (triggerData.length > 0) {
          triggerData.slice(0, 5).forEach((trigger, index) => {
            const severity = trigger.avgSeverity;
            const severityIcon = severity >= 8 ? '🔴' : severity >= 6 ? '🟠' : severity >= 4 ? '🟡' : '🟢';
            
            report += `${index + 1}. ${severityIcon} ${trigger.trigger.toUpperCase()}
   📈 Frequency: ${trigger.count} occurrences (${Math.round((trigger.count / weekAnalyses.length) * 100)}% of sessions)
   📊 Severity: ${(trigger?.avgSeverity !== null && trigger?.avgSeverity !== undefined && !isNaN(Number(trigger.avgSeverity)) ? Number(trigger.avgSeverity).toFixed(1) : '0.0')}/10 average
   📂 Category: ${trigger.category}

   🧠 CLINICAL INSIGHT:
   ${trigger.whyExplanation}

   🔗 Related Patterns: ${trigger.relatedTriggers?.slice(0, 3).join(', ') || 'None identified'}

   💡 RECOMMENDATIONS:
   ${trigger.avgSeverity >= 7 ? '• Immediate therapeutic intervention recommended\n   • Consider professional consultation\n   • Implement crisis management strategies' : 
     trigger.avgSeverity >= 5 ? '• Focus on coping skill development\n   • Regular monitoring recommended\n   • Practice anxiety reduction techniques' : 
     '• Continue current management approach\n   • Maintain awareness of trigger patterns\n   • Build resilience strategies'}

`;
          });
        } else {
          report += `No specific triggers identified for this week.
This may indicate good emotional regulation or limited session data.

`;
        }
      }
    } else {
      // Fallback to original summaries if no analyses available
      weekSummaries.forEach(summary => {
        const formattedType = summary.intervention_type.replace('_', ' ').toUpperCase();
        report += `📝 ${formattedType} (${summary.conversation_count} conversations)
${'-'.repeat(formattedType.length + 25)}

INTERVENTION HIGHLIGHTS:
`;
        
        const keyPoints = summary.key_points.slice(0, 8);
        keyPoints.forEach((point, pointIndex) => {
          report += `  ✓ ${point}
`;
        });
        report += `

`;
      });
    }
  }

  // Enhanced clinical trigger analysis
  if (analyses && analyses.length > 0) {
    const triggerData = processTriggerData(analyses);
    
    if (triggerData.length > 0) {
      report += `

==================================================
🔬 COMPREHENSIVE ANXIETY TRIGGER ANALYSIS
==================================================

This section provides in-depth analysis of your anxiety patterns, triggers, 
and therapeutic insights based on ${totalAnalyses} conversation sessions.

`;
      
      triggerData.forEach((trigger, index) => {
        const severity = trigger.avgSeverity;
        const frequency = trigger.count;
        const prevalence = Math.round((frequency / totalAnalyses) * 100);
        
        const severityLevel = severity >= 8 ? 'CRITICAL' : severity >= 6 ? 'HIGH' : severity >= 4 ? 'MODERATE' : 'LOW';
        const severityIcon = severity >= 8 ? '🔴' : severity >= 6 ? '🟠' : severity >= 4 ? '🟡' : '🟢';
        const frequencyIcon = prevalence >= 50 ? '🔥' : prevalence >= 25 ? '⚡' : '💧';
        
        report += `
${index + 1}. ${severityIcon} ${trigger.trigger.toUpperCase()}
${'='.repeat(60)}

📊 TRIGGER METRICS:
• Occurrence Rate: ${frequency} times (${prevalence}% of all sessions) ${frequencyIcon}
• Average Severity: ${(severity !== null && severity !== undefined && !isNaN(Number(severity)) ? Number(severity).toFixed(1) : '0.0')}/10 (${severityLevel})
• Category: ${trigger.category}
• Risk Level: ${severity >= 7 ? 'HIGH PRIORITY' : severity >= 5 ? 'MODERATE PRIORITY' : 'LOW PRIORITY'}

📝 DESCRIPTION:
${trigger.description}

🧠 CLINICAL EXPLANATION:
${trigger.whyExplanation}

🔗 ASSOCIATED TRIGGERS:
${trigger.relatedTriggers?.length ? trigger.relatedTriggers.join(', ') : 'None identified - this appears to be an isolated trigger pattern'}

💡 THERAPEUTIC RECOMMENDATIONS:
${severity >= 7 ? 
`• IMMEDIATE ACTION REQUIRED
• Consider increasing therapy session frequency
• Implement crisis intervention protocols
• Develop specific coping strategies for this trigger
• Monitor closely for escalation patterns
• Consider medication consultation if not already addressed` :
severity >= 5 ?
`• MODERATE INTERVENTION NEEDED
• Focus therapy sessions on this trigger pattern
• Develop targeted coping mechanisms
• Practice mindfulness and grounding techniques
• Regular check-ins recommended
• Build support system awareness` :
`• MAINTENANCE APPROACH
• Continue current management strategies
• Maintain awareness of trigger patterns
• Build preventive coping skills
• Regular self-monitoring recommended`}

📈 PROGRESS TRACKING:
${prevalence >= 50 ? 'This trigger appears frequently - establishing a management plan is crucial' :
  prevalence >= 25 ? 'Moderate frequency - good opportunity for targeted intervention' :
  'Lower frequency - maintain awareness and develop prevention strategies'}

`;
      });
    }
  }

  // Enhanced goals section
  if (goals && goals.length > 0) {
    report += `

==================================================
🎯 THERAPEUTIC GOAL PROGRESS & OUTCOMES
==================================================

Goal-setting and tracking are essential components of effective therapy. 
This section analyzes your progress across ${goals.length} therapeutic goals.

OVERALL GOAL PERFORMANCE:
• Total Goals: ${goals.length}
• Completed Goals: ${goals.filter(g => (g.completion_rate || 0) >= 90).length}
• In Progress: ${goals.filter(g => (g.completion_rate || 0) >= 50 && (g.completion_rate || 0) < 90).length}
• Needs Attention: ${goals.filter(g => (g.completion_rate || 0) < 50).length}
• Average Progress: ${Math.round(goals.reduce((sum, g) => sum + (g.completion_rate || 0), 0) / goals.length)}%

`;
    
    goals.forEach((goal, index) => {
      const completionRate = goal.completion_rate || 0;
      const averageScore = goal.average_score || 0;
      
      const status = completionRate >= 90 ? '🟢 EXCELLENT' : 
                   completionRate >= 70 ? '🟡 GOOD' :
                   completionRate >= 50 ? '🟠 FAIR' : '🔴 NEEDS ATTENTION';
      
      const progressIcon = completionRate >= 90 ? '🎉' : 
                          completionRate >= 70 ? '💪' :
                          completionRate >= 50 ? '📈' : '⚠️';
      
      report += `
${progressIcon} GOAL ${index + 1}: ${goal.title}
${'-'.repeat(50)}

📋 GOAL DETAILS:
• Category: ${goal.category}
• Target End Date: ${goal.end_date || 'Ongoing/Flexible'}
• Current Status: ${status}
• Description: ${goal.description || 'No detailed description provided'}

📊 PERFORMANCE METRICS:
• Completion Rate: ${Math.round(completionRate)}%
• Average Score: ${(averageScore !== null && averageScore !== undefined && !isNaN(Number(averageScore)) ? Number(averageScore).toFixed(1) : '0.0')}/10
• Progress Trend: ${completionRate >= 70 ? 'Excellent trajectory' : 
                  completionRate >= 50 ? 'Steady progress' : 
                  'Requires focused attention'}

💡 RECOMMENDATIONS:
${completionRate >= 90 ? 
`• Congratulations on excellent progress!
• Consider setting new, more challenging goals
• Use this success as motivation for other areas
• Share successful strategies with similar goals` :
completionRate >= 70 ?
`• Great progress - maintain current approach
• Identify specific barriers to further progress
• Increase accountability measures
• Consider breaking remaining tasks into smaller steps` :
completionRate >= 50 ?
`• Progress is being made but acceleration needed
• Review goal structure and timeline
• Identify specific obstacles preventing progress
• Consider additional support or resources
• Break goal into smaller, manageable milestones` :
`• Goal requires immediate attention and restructuring
• Consider if goal is realistic and appropriately scoped
• Identify specific barriers preventing progress
• May need professional guidance for this area
• Consider breaking into much smaller, achievable steps`}

`;
    });
  }

  // Enhanced conclusion and recommendations
  report += `

==================================================
📋 CLINICAL SUMMARY & RECOMMENDATIONS
==================================================

OVERALL MENTAL HEALTH STATUS:
${avgAnxiety < 4 ? 
`🟢 EXCELLENT: Your anxiety levels are well-managed with an average of ${(avgAnxiety !== null && avgAnxiety !== undefined && !isNaN(Number(avgAnxiety)) ? Number(avgAnxiety).toFixed(1) : '0.0')}/10. 
Continue current strategies and maintain regular check-ins.` :
avgAnxiety < 6 ?
`🟡 GOOD: Your anxiety levels show good management with an average of ${(avgAnxiety !== null && avgAnxiety !== undefined && !isNaN(Number(avgAnxiety)) ? Number(avgAnxiety).toFixed(1) : '0.0')}/10. 
Some areas may benefit from focused attention.` :
avgAnxiety < 8 ?
`🟠 MODERATE CONCERN: Your anxiety levels average ${(avgAnxiety !== null && avgAnxiety !== undefined && !isNaN(Number(avgAnxiety)) ? Number(avgAnxiety).toFixed(1) : '0.0')}/10, indicating need for 
increased therapeutic intervention and support.` :
`🔴 HIGH CONCERN: Your anxiety levels average ${(avgAnxiety !== null && avgAnxiety !== undefined && !isNaN(Number(avgAnxiety)) ? Number(avgAnxiety).toFixed(1) : '0.0')}/10, suggesting immediate 
professional attention and intensive support may be needed.`}

KEY INSIGHTS:
• Session Engagement: ${totalAnalyses >= 12 ? 'Excellent' : totalAnalyses >= 8 ? 'Good' : totalAnalyses >= 4 ? 'Fair' : 'Needs Improvement'}
• Crisis Management: ${crisisRiskSessions === 0 ? 'Effective' : 'Requires Attention'}
• Goal Achievement: ${goals && goals.length > 0 ? 
  Math.round(goals.reduce((sum, g) => sum + (g.completion_rate || 0), 0) / goals.length) >= 70 ? 'Strong' : 'Developing' : 'Not Set'}

PRIORITY RECOMMENDATIONS:
${crisisRiskSessions > 0 ? '🚨 IMMEDIATE: Address crisis risk factors with professional support\n' : ''}${escalationCount > totalAnalyses * 0.3 ? '⚠️ HIGH: Reduce escalation frequency through coping skill development\n' : ''}${avgAnxiety >= 7 ? '📈 IMPORTANT: Focus on anxiety reduction through targeted interventions\n' : ''}${goals && goals.filter(g => (g.completion_rate || 0) < 50).length > 0 ? '🎯 MODERATE: Restructure underperforming goals for better success\n' : ''}✅ ONGOING: Continue regular engagement and monitoring

NEXT STEPS:
1. ${avgAnxiety >= 6 ? 'Schedule professional consultation for anxiety management' : 'Maintain current therapeutic approach'}
2. ${totalAnalyses < 8 ? 'Increase session frequency for better data and support' : 'Continue regular session schedule'}
3. ${goals && goals.length < 3 ? 'Consider setting additional therapeutic goals' : 'Review and adjust current goals as needed'}
4. Focus on highest-severity triggers identified in this report
5. Implement recommended coping strategies for priority areas

==================================================

📄 REPORT INFORMATION
====================

Report Type: Comprehensive Mental Health Analysis
Generated: ${today}
Data Period: ${sortedSummaries.length > 0 ? 
  `${sortedSummaries[sortedSummaries.length - 1].week_start} to ${sortedSummaries[0].week_end}` : 'N/A'}
Total Sessions Analyzed: ${totalAnalyses}
Report Version: 2.0 (Enhanced Clinical Analysis)

This report was generated automatically based on your conversation patterns, 
anxiety assessments, and therapeutic interventions. For immediate concerns or 
crisis situations, please contact your mental health provider or emergency services.

For more detailed real-time analytics and interactive insights, 
visit the Analytics Dashboard in your application.

==================================================
`;

  return report;
};

export const downloadSummaryReport = (summaries: InterventionSummary[], goals: GoalWithProgress[], analyses?: ClaudeAnxietyAnalysisWithDate[]) => {
  const report = generateSummaryReport(summaries, goals, analyses);
  
  // Convert to HTML for better formatting (PDF-like)
  const htmlContent = convertToPDFFormat(report);
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversation-summaries-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const convertToPDFFormat = (textContent: string): string => {
  // Enhanced text processing for better HTML structure
  let htmlContent = textContent
    .replace(/\n/g, '<br>')
    .replace(/=+/g, '<div class="divider"></div>')
    .replace(/^([A-Z][A-Z\s]+)$/gm, '<h2 class="section-title">$1</h2>')
    .replace(/^(Week: .+)$/gm, '<h3 class="week-title">$1</h3>')
    .replace(/^([A-Z\s]+) \((\d+) conversations\)$/gm, '<h4 class="intervention-title">$1 <span class="conversation-count">($2 conversations)</span></h4>')
    .replace(/^CLINICAL SUMMARY FOR THIS WEEK$/gm, '<h4 class="clinical-summary-title">Clinical Summary for This Week</h4>')
    .replace(/^DETAILED TRIGGER ANALYSIS:$/gm, '<h4 class="trigger-analysis-title">Detailed Trigger Analysis</h4>')
    .replace(/^(\d+\. [A-Z\s]+)$/gm, '<h5 class="trigger-item-title">$1</h5>')
    .replace(/^\s+(\d+\. .+)$/gm, '<li class="key-point">$1</li>')
    .replace(/^•\s(.+)$/gm, '<div class="stat-item">• $1</div>')
    .replace(/^CLINICAL INSIGHT:$/gm, '<div class="insight-label">Clinical Insight:</div>')
    .replace(/^Related patterns:(.+)$/gm, '<div class="related-patterns">Related patterns:$1</div>');

  // Group list items into proper ul tags
  htmlContent = htmlContent.replace(/(<li class="key-point">.*?<\/li>)+/gs, '<ul class="key-points-list">$&</ul>');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Conversation Intervention Summaries</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 40px;
          line-height: 1.7;
          color: #1f2937;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
          pointer-events: none;
        }
        
        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }
        
        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .content {
          padding: 40px;
        }
        
        .section-title {
          color: #1e40af;
          font-size: 1.8rem;
          font-weight: 700;
          margin: 40px 0 24px;
          padding: 16px 0;
          border-bottom: 3px solid #3b82f6;
          background: linear-gradient(90deg, #eff6ff 0%, transparent 100%);
          padding-left: 20px;
          margin-left: -20px;
          padding-right: 20px;
          margin-right: -20px;
          border-radius: 8px 0 0 8px;
        }
        
        .week-title {
          color: #1f2937;
          font-size: 1.4rem;
          font-weight: 600;
          margin: 32px 0 20px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          border-left: 4px solid #0ea5e9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .clinical-summary-title {
          color: #059669;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 24px 0 16px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }
        
        .trigger-analysis-title {
          color: #dc2626;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 24px 0 16px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-radius: 8px;
          border-left: 4px solid #ef4444;
        }
        
        .trigger-item-title {
          color: #7c2d12;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 20px 0 12px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%);
          border-radius: 6px;
          border-left: 3px solid #ea580c;
        }
        
        .intervention-title {
          color: #374151;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 24px 0 16px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }
        
        .conversation-count {
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 400;
        }
        
        .stat-item {
          margin: 8px 0;
          padding: 8px 16px;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
          font-weight: 500;
        }
        
        .key-points-list {
          margin: 16px 0;
          padding: 0;
          background: #fafafa;
          border-radius: 8px;
          padding: 16px 20px;
        }
        
        .key-point {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 500;
          color: #374151;
        }
        
        .key-point:last-child {
          border-bottom: none;
        }
        
        .insight-label {
          color: #7c3aed;
          font-weight: 600;
          margin: 16px 0 8px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%);
          border-radius: 6px;
          border-left: 3px solid #8b5cf6;
        }
        
        .related-patterns {
          color: #6b7280;
          font-style: italic;
          margin: 12px 0;
          padding: 10px 14px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px dashed #d1d5db;
        }
        
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
          margin: 32px 0;
          border-radius: 1px;
        }
        
        .overview {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 20px;
          border-radius: 12px;
          margin: 24px 0;
          border-left: 4px solid #f59e0b;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Print styles */
        @media print {
          body {
            background: white;
            padding: 20px;
          }
          
          .container {
            box-shadow: none;
            border: 1px solid #e5e7eb;
          }
          
          .header {
            background: #3b82f6 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          body {
            padding: 20px;
          }
          
          .header h1 {
            font-size: 2rem;
          }
          
          .content {
            padding: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Conversation Intervention Summaries</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <div class="content">
          ${htmlContent}
        </div>
      </div>
    </body>
    </html>
  `;
};