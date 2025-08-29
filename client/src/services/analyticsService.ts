// Analytics service - migrated from Supabase to new API endpoints
import { ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';

// Extended interface to include database dates
export interface ClaudeAnxietyAnalysisWithDate extends ClaudeAnxietyAnalysis {
  created_at: string;
}

export interface AnalyticsData {
  messages: Array<{
    id: string;
    content: string;
    sender: string;
    created_at: string;
    anxietyAnalysis?: ClaudeAnxietyAnalysis;
  }>;
  anxietyAnalyses: ClaudeAnxietyAnalysisWithDate[];
}

export interface AnxietyTrend {
  date: string;
  anxietyLevel: number;
  triggers: string[];
  treatmentResponse?: number;
}

export interface TreatmentOutcome {
  period: string;
  averageAnxiety: number;
  improvement: number;
  treatmentEffectiveness: 'improving' | 'stable' | 'declining';
}

export const analyticsService = {
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // Get current user from auth - force fresh import and clear any cache
      const { AuthService } = await import('@/services/authService');
      const currentUser = await AuthService.getCurrentUser();
      
      if (!currentUser?.id) {
        console.warn('No authenticated user found for analytics');
        return { messages: [], anxietyAnalyses: [] };
      }

      console.log('📊 Fetching analytics for user ID:', currentUser.id);
      console.log('📊 Full user object:', currentUser);
      
      // Clear any cached responses by adding timestamp
      const cacheBuster = Date.now();

      // Fetch user's chat messages and anxiety analyses with cache busting
      const [messagesResponse, analysesResponse] = await Promise.all([
        fetch(`/api/users/${currentUser.id}/messages?t=${cacheBuster}`, { 
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`/api/users/${currentUser.id}/anxiety-analyses?t=${cacheBuster}`, { 
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      let messages = [];
      let anxietyAnalyses = [];

      if (messagesResponse.ok) {
        const messageText = await messagesResponse.text();
        try {
          messages = JSON.parse(messageText);
          // Normalize message data structure
          messages = (Array.isArray(messages) ? messages : []).map((m: any) => ({
            ...m,
            created_at: m.created_at ?? m.createdAt ?? new Date().toISOString()
          }));
        } catch (e) {
          console.error('Invalid JSON response for messages:', messageText.substring(0, 200));
          messages = [];
        }
      } else {
        console.warn('Failed to fetch messages:', messagesResponse.status, messagesResponse.statusText);
      }

      if (analysesResponse.ok) {
        const analysisText = await analysesResponse.text();
        try {
          anxietyAnalyses = JSON.parse(analysisText);
          // Normalize analysis data structure - map DB fields to UI fields
          anxietyAnalyses = (Array.isArray(anxietyAnalyses) ? anxietyAnalyses : []).map((a: any) => ({
            anxietyLevel: a.anxietyLevel ?? a.anxiety_level ?? 0,
            gad7Score: Math.max(0, Math.min(21, (a.anxietyLevel ?? a.anxiety_level ?? 0) * 2.1)),
            // Map DB fields -> UI fields
            beckAnxietyCategories: a.anxietyTriggers ?? a.triggers ?? [],
            dsm5Indicators: a.anxietyTriggers ?? a.triggers ?? [],
            triggers: Array.isArray(a.anxietyTriggers)
              ? a.anxietyTriggers
              : (typeof a.anxietyTriggers === 'string'
                  ? a.anxietyTriggers.split(',').map((s: string) => s.trim()).filter(Boolean)
                  : (Array.isArray(a.triggers)
                      ? a.triggers
                      : (typeof a.triggers === 'string'
                          ? a.triggers.split(',').map((s: string) => s.trim()).filter(Boolean)
                          : []))),
            cognitiveDistortions: a.cognitiveDistortions ?? [],
            recommendedInterventions: a.recommendedInterventions ?? a.copingStrategies ?? [],
            therapyApproach: a.therapyApproach ?? 'CBT',
            crisisRiskLevel: a.crisisRiskLevel ?? 'low',
            sentiment: a.sentiment ?? 'neutral',
            escalationDetected: a.escalationDetected ?? false,
            personalizedResponse: a.personalizedResponse ?? a.personalized_response ?? '',
            confidenceScore: Number.isFinite(a.confidenceScore) ? a.confidenceScore : 0.7,
            responseEffectiveness: a.responseEffectiveness ?? 0,
            created_at: a.created_at ?? a.createdAt ?? new Date().toISOString()
          }));
        } catch (e) {
          console.error('Invalid JSON response for analyses:', analysisText.substring(0, 200));
          anxietyAnalyses = [];
        }
      } else {
        console.warn('Failed to fetch anxiety analyses:', analysesResponse.status, analysesResponse.statusText);
      }

      console.log('📊 Analytics data loaded:', {
        userId: currentUser.id,
        messagesCount: messages.length,
        analysesCount: anxietyAnalyses.length
      });

      return {
        messages: messages || [],
        anxietyAnalyses: anxietyAnalyses || []
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  },

  async getAnxietyTrends(userId: string, startDate: Date, endDate: Date): Promise<AnxietyTrend[]> {
    try {
      // Placeholder implementation
      console.log('Fetching anxiety trends for user:', userId, 'from', startDate, 'to', endDate);
      return [];
    } catch (error) {
      console.error('Error fetching anxiety trends:', error);
      throw error;
    }
  },

  async getTreatmentOutcomes(userId: string): Promise<TreatmentOutcome[]> {
    try {
      // Placeholder implementation  
      console.log('Fetching treatment outcomes for user:', userId);
      return [];
    } catch (error) {
      console.error('Error fetching treatment outcomes:', error);
      throw error;
    }
  },

  generateAnxietyTrends(analyses: ClaudeAnxietyAnalysisWithDate[]): AnxietyTrend[] {
    try {
      if (!analyses || analyses.length === 0) {
        return [];
      }

      // Group analyses by date and calculate daily trends
      const dailyData: Record<string, { levels: number[], triggers: Set<string> }> = {};
      
      analyses.forEach(analysis => {
        const date = new Date(analysis.created_at).toISOString().split('T')[0];
        const anxietyLevel = analysis.anxietyLevel || 0;
        const triggers = analysis.triggers || [];
        
        if (!dailyData[date]) {
          dailyData[date] = { levels: [], triggers: new Set() };
        }
        
        dailyData[date].levels.push(anxietyLevel);
        triggers.forEach(trigger => dailyData[date].triggers.add(trigger));
      });

      // Convert to trend format with averages
      const trends: AnxietyTrend[] = Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          anxietyLevel: Math.round(data.levels.reduce((sum, level) => sum + level, 0) / data.levels.length),
          triggers: Array.from(data.triggers),
          treatmentResponse: data.levels.length > 1 ? 
            Math.round(((data.levels[0] - data.levels[data.levels.length - 1]) / data.levels[0]) * 100) : 0
        }));

      return trends;
    } catch (error) {
      console.error('Error generating anxiety trends:', error);
      return [];
    }
  },

  calculateTreatmentOutcomes(analyses: ClaudeAnxietyAnalysisWithDate[]): TreatmentOutcome[] {
    try {
      if (!analyses || analyses.length === 0) {
        return [];
      }

      // Group analyses by week to calculate treatment outcomes
      const weeklyData: Record<string, { levels: number[], dates: Date[] }> = {};
      
      analyses.forEach(analysis => {
        const date = new Date(analysis.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week
        const weekKey = weekStart.toISOString().split('T')[0];
        
        const anxietyLevel = analysis.anxietyLevel || 0;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { levels: [], dates: [] };
        }
        
        weeklyData[weekKey].levels.push(anxietyLevel);
        weeklyData[weekKey].dates.push(date);
      });

      // Convert to treatment outcome format
      const outcomes: TreatmentOutcome[] = Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekKey, data], index, arr) => {
          const weekDate = new Date(weekKey);
          const period = weekDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          const averageAnxiety = Math.round(
            data.levels.reduce((sum, level) => sum + level, 0) / data.levels.length
          );
          
          // Calculate improvement compared to previous week
          let improvement = 0;
          let treatmentEffectiveness: 'improving' | 'stable' | 'declining' = 'stable';
          
          if (index > 0) {
            const prevData = arr[index - 1][1];
            const prevAverage = prevData.levels.reduce((sum, level) => sum + level, 0) / prevData.levels.length;
            improvement = Math.round(((prevAverage - averageAnxiety) / prevAverage) * 100);
            
            if (improvement > 10) {
              treatmentEffectiveness = 'improving';
            } else if (improvement < -10) {
              treatmentEffectiveness = 'declining';
            } else {
              treatmentEffectiveness = 'stable';
            }
          }

          return {
            period,
            averageAnxiety,
            improvement,
            treatmentEffectiveness
          };
        });

      return outcomes;
    } catch (error) {
      console.error('Error calculating treatment outcomes:', error);
      return [];
    }
  },

  async exportAnalyticsData(userId: string, format: 'json' | 'csv' = 'json') {
    try {
      const data = await this.getAnalyticsData();
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'date,anxietyLevel,triggers,content\n';
        const csvRows = data.messages.map(msg => 
          `${msg.created_at},${msg.anxietyAnalysis?.anxietyLevel || 0},"${msg.anxietyAnalysis?.triggers.join(';') || ''}","${msg.content}"`
        ).join('\n');
        
        return csvHeader + csvRows;
      }

      return data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
};