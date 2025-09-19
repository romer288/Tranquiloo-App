
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, Target, Calendar } from 'lucide-react';
import { ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';
import { therapistReportService } from '@/services/therapistReportService';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsHeaderProps {
  analysesCount: number;
  onDownloadHistory: () => void;
  onShareWithTherapist: () => void;
  onDownloadSummary: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  analysesCount,
  onDownloadHistory,
  onShareWithTherapist,
  onDownloadSummary
}) => {
  const { toast } = useToast();

  const handleShareWithTherapist = async () => {
    const result = await therapistReportService.shareAnalyticsWithTherapist();
    
    toast({
      title: result.success ? "Report Sent" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600">
            {analysesCount > 0 
              ? `Showing data from ${analysesCount} anxiety analysis sessions`
              : 'No data yet - start chatting to see analytics'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={onDownloadHistory} variant="outline" size="sm" disabled={analysesCount === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download History
          </Button>
          <Button onClick={onDownloadSummary} variant="outline" size="sm" disabled={analysesCount === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download Conversation Summary
          </Button>
          <Button onClick={handleShareWithTherapist} variant="outline" size="sm" disabled={analysesCount === 0}>
            <Share className="w-4 h-4 mr-2" />
            Share with Therapist
          </Button>
          <Button 
            onClick={() => window.location.href = '/treatment-resources'} 
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Target className="w-4 h-4 mr-2" />
            View Treatment
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Real-time data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
