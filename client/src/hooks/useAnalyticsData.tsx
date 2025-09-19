
import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsData, ClaudeAnxietyAnalysisWithDate } from '@/services/analyticsService';
import { ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';

export const useAnalyticsData = () => {
  const [data, setData] = useState<AnalyticsData>({
    messages: [],
    anxietyAnalyses: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analyticsData = await analyticsService.getAnalyticsData();
      setData(analyticsData);
      console.log('📊 useAnalyticsData - Data loaded:', {
        messagesCount: analyticsData.messages.length,
        analysesCount: analyticsData.anxietyAnalyses.length,
        firstAnalysis: analyticsData.anxietyAnalyses[0],
        firstMessage: analyticsData.messages[0]
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Debug: force re-fetch when component mounts to clear any caching issues
  useEffect(() => {
    console.log('🔄 Analytics hook mounted - forcing data refresh...');
    setTimeout(() => {
      fetchData();
    }, 1000);
  }, []);

  // Get all anxiety analyses from both messages and direct analyses
  const getAllAnalyses = (): ClaudeAnxietyAnalysisWithDate[] => {
    const messageAnalyses = data.messages
      .filter(msg => msg.sender === 'user' && msg.anxietyAnalysis)
      .map(msg => ({
        ...msg.anxietyAnalysis as ClaudeAnxietyAnalysis,
        created_at: msg.created_at
      }));
    
    // Combine and deduplicate - prefer direct analyses as they have more complete data
    const allAnalyses = [...data.anxietyAnalyses, ...messageAnalyses]
      .filter((analysis, index, arr) => 
        arr.findIndex(a => JSON.stringify(a) === JSON.stringify(analysis)) === index
      ) as ClaudeAnxietyAnalysisWithDate[];

    console.log('📊 getAllAnalyses - Combined analyses:', allAnalyses.length);
    return allAnalyses;
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    getAllAnalyses
  };
};
