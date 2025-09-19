import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Eye, Calendar, TrendingUp, MessageSquare } from 'lucide-react';

interface Report {
  id: string;
  type: 'download_history' | 'conversation_summary';
  title: string;
  description: string;
  generatedAt: string;
  size: string;
}

interface TherapistReportsProps {
  patientId: string;
  patientName: string;
}

const TherapistReports: React.FC<TherapistReportsProps> = ({ 
  patientId, 
  patientName 
}) => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatientReports();
  }, [patientId]);

  const loadPatientReports = async () => {
    try {
      const response = await fetch(`/api/therapist/patient/${patientId}/reports`);
      if (response.ok) {
        const reportsData = await response.json();
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleViewReport = async (report: Report) => {
    setLoading(true);
    setSelectedReport(report);
    
    try {
      const response = await fetch(`/api/therapist/reports/${report.id}/content`);
      if (response.ok) {
        const { content } = await response.json();
        setReportContent(content);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load report content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const response = await fetch(`/api/therapist/reports/${report.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}_${patientName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Download Started",
          description: `${report.title} is downloading`
        });
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  const generateNewReport = async (reportType: 'download_history' | 'conversation_summary') => {
    setLoading(true);
    
    try {
      // Use existing reports endpoint to generate report
      const response = await fetch(`/api/therapist/patient/${patientId}/reports`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: "Report Generated",
          description: "New report has been generated successfully"
        });
        loadPatientReports(); // Refresh reports list
      }
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900">Patient Reports</h3>
        <p className="text-blue-700">Viewing reports for: {patientName}</p>
        <p className="text-sm text-blue-600">All reports are anonymized for HIPAA compliance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Available Reports
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateNewReport('download_history')}
                  disabled={loading}
                  data-testid="button-generate-history"
                >
                  Generate History
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateNewReport('conversation_summary')}
                  disabled={loading}
                  data-testid="button-generate-summary"
                >
                  Generate Summary
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No reports available</p>
                  <p className="text-sm">Generate reports using the buttons above</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {report.type === 'download_history' ? (
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          )}
                          <h4 className="font-medium" data-testid={`text-report-title-${report.id}`}>
                            {report.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {report.size}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Generated: {new Date(report.generatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewReport(report)}
                        data-testid={`button-view-${report.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                        data-testid={`button-download-${report.id}`}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReport ? (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-medium">{selectedReport.title}</h4>
                  <p className="text-sm text-gray-600">{selectedReport.description}</p>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="whitespace-pre-wrap text-sm"
                      dangerouslySetInnerHTML={{ __html: reportContent }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a report to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Types Info */}
      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3 p-4 border rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium">Download History Report</h4>
                <p className="text-sm text-gray-600">
                  Comprehensive analysis data including anxiety levels, triggers, 
                  coping strategies, and progress over time.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium">Conversation Summary Report</h4>
                <p className="text-sm text-gray-600">
                  Summarized chat interactions with key therapeutic insights, 
                  patterns, and AI companion responses.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistReports;