import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, TrendingUp, Download, FileText, Share, MessageCircle, Clipboard, Bell, Settings, HeartHandshake } from 'lucide-react';

// Import therapist components
import TherapistChatInterface from '@/components/therapist/TherapistChatInterface';
import TreatmentCreation from '@/components/therapist/TreatmentCreation';
import TherapistNotifications from '@/components/therapist/TherapistNotifications';

// Import analytics components to match patient view exactly
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnxietyAnalyticsTracker from '@/components/AnxietyAnalyticsTracker';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import AnxietyChartsSection from '@/components/analytics/AnxietyChartsSection';
import TreatmentOutcomes from '@/components/TreatmentOutcomes';
import MonthlyChartsSection from '@/components/analytics/MonthlyChartsSection';
import GoalProgressSection from '@/components/analytics/GoalProgressSection';
import TriggerAnalysisTable from '@/components/analytics/TriggerAnalysisTable';
import InterventionSummariesSection from '@/components/analytics/InterventionSummariesSection';
import { processTriggerData, processSeverityDistribution, getAnalyticsMetrics } from '@/utils/analyticsDataProcessor';
import { buildWeeklyTrendsData } from '@/utils/buildWeeklyTrendsData';

interface PatientRecord {
  id: string;
  user_id: string;
  therapist_name: string;
  contact_value: string;
  created_at: string;
  patient_profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('search');
  const [therapistEmail, setTherapistEmail] = useState('');

  // Initialize therapist email when component loads
  React.useEffect(() => {
    if (user?.email) {
      setTherapistEmail(user.email);
    }
  }, [user?.email]);

  // Process analytics data unconditionally at top level
  const analysesForTrends = selectedPatientData?.analyses ?? [];
  const weeklyTrends = React.useMemo(
    () => buildWeeklyTrendsData(analysesForTrends),
    [analysesForTrends]
  );

  const handlePatientSearch = async () => {
    if (!searchEmail || !searchCode) {
      toast({
        title: "Search Required", 
        description: "Please enter both patient email AND patient code",
        variant: "destructive"
      });
      return;
    }
    
    if (!therapistEmail) {
      toast({
        title: "Therapist Email Required",
        description: "Please enter your therapist email address",
        variant: "destructive"
      });
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch('/api/therapist/search-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: searchEmail,
          patientCode: searchCode
        })
      });

      if (response.ok) {
        const patient = await response.json();
        setPatientRecords([{
          id: patient.id,
          user_id: patient.id,
          therapist_name: user?.email || '',
          contact_value: user?.email || '',
          created_at: new Date().toISOString(),
          patient_profile: {
            first_name: patient.firstName || '',
            last_name: patient.lastName || '',
            email: patient.email
          }
        }]);
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with the provided credentials",
          variant: "destructive"
        });
        setPatientRecords([]);
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for patient",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPatient = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('analytics'); // Switch to analytics tab when patient is selected
    
    // Helper function to calculate completion rate
    const calcCompletion = (goal: any) => {
      const progress = goal.goal_progress ?? goal.progress_history ?? [];
      const start = new Date(goal.start_date ?? goal.created_at ?? Date.now());
      const days = Math.max(1, Math.ceil((Date.now() - start.getTime()) / 86400000));
      let expected = 1;
      switch ((goal.frequency ?? '').toLowerCase()) {
        case 'daily': expected = days; break;
        case 'weekly': expected = Math.ceil(days / 7); break;
        case 'monthly': expected = Math.ceil(days / 30); break;
      }
      const actual = progress.length;
      return Math.min(100, (actual / expected) * 100);
    };
    
    // Load patient's complete analytics data
    try {
      const response = await fetch(`/api/therapist/patient-analytics?patientId=${encodeURIComponent(patientId)}&therapistEmail=${encodeURIComponent(therapistEmail || user?.email || '')}`);
      if (response.ok) {
        const analyticsData = await response.json();
        
        // Normalize analytics data to handle both camelCase and snake_case
        const normalizedData = {
          ...analyticsData,
          analyses: (analyticsData.analyses || []).map((analysis: any) => ({
            id: analysis.id,
            user_id: analysis.user_id || analysis.userId || patientId,
            anxietyLevel: analysis.anxiety_level || analysis.anxietyLevel || 0,
            triggers: analysis.anxietyTriggers || analysis.anxiety_triggers || analysis.triggers || [],
            created_at: analysis.created_at || analysis.createdAt || new Date().toISOString(),
            personalizedResponse: analysis.personalized_response || analysis.personalizedResponse || '',
            copingStrategies: analysis.coping_strategies || analysis.copingStrategies || []
          })),
          goals: (analyticsData.goals || []).map((goal: any) => {
            const progress = goal.goal_progress ?? [];
            const avg = progress.length
              ? progress.reduce((s: number, p: any) => s + (p.score ?? 0), 0) / progress.length
              : 0;
            return {
              ...goal,
              created_at: goal.created_at || goal.createdAt,
              updated_at: goal.updated_at || goal.updatedAt,
              user_id: goal.user_id || goal.userId || patientId,
              progress_history: progress,
              average_score: avg,
              completion_rate: calcCompletion(goal),
              latest_progress: progress[0] ?? null
            };
          }),
          summaries: (analyticsData.summaries || []).map((summary: any) => ({
            ...summary,
            created_at: summary.created_at || summary.createdAt,
            user_id: summary.user_id || summary.userId || patientId
          }))
        };
        
        setSelectedPatientData(normalizedData);
      }
    } catch (error) {
      console.error('Failed to load patient analytics:', error);
    }
  };

  // Memoize handlers to prevent re-renders
  const handlePatientSearchMemo = React.useCallback(handlePatientSearch, [searchEmail, searchCode, therapistEmail, toast]);
  const handleSelectPatientMemo = React.useCallback(handleSelectPatient, [therapistEmail, user?.email]);



  const handleLogout = () => {
    // Redirect to logout endpoint which handles the logout flow
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mental Therapist Portal
            </h1>
            <p className="text-gray-600">
              Welcome, Dr. {user?.username || 'Therapist'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="bg-green-600">
              Therapist Dashboard
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={!selectedPatientId}>
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center gap-2" disabled={!selectedPatientId}>
              <Clipboard className="w-4 h-4" />
              Treatment
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2" disabled={!selectedPatientId}>
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2" disabled={!selectedPatientId}>
              <MessageCircle className="w-4 h-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Find Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Therapist Email
                  </label>
                  <Input
                    type="email"
                    placeholder="therapist@example.com"
                    value={therapistEmail}
                    onChange={(e) => setTherapistEmail(e.target.value)}
                    data-testid="input-therapist-email"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Patient Email
                    </label>
                    <Input
                      type="email"
                      placeholder="patient@email.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Patient Code
                    </label>
                    <Input
                      placeholder="PT-XXXXXX"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handlePatientSearchMemo}
                  disabled={searchLoading}
                  className="w-full"
                >
                  {searchLoading ? 'Searching...' : 'Search Patient'}
                </Button>
              </CardContent>
            </Card>

            {patientRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientRecords.map((patient) => (
                    <div 
                      key={patient.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSelectPatientMemo(patient.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            {patient.patient_profile.first_name} {patient.patient_profile.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {patient.patient_profile.email}
                          </p>
                        </div>
                        <Button size="sm">View Patient Data</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            {selectedPatientData ? (
              <div className="min-h-screen bg-gray-50">
                <AnalyticsHeader 
                  analysesCount={selectedPatientData.analyses?.length || 0}
                  onDownloadHistory={() => {}}
                  onShareWithTherapist={() => {}}
                  onDownloadSummary={() => {}}
                />

                <div className="max-w-7xl mx-auto px-8 py-8">
                  {/* Anxiety Analytics Tracker */}
                  <AnxietyAnalyticsTracker analyses={selectedPatientData.analyses || []} />

                  {(selectedPatientData.analyses?.length || 0) === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <p className="text-gray-600 text-lg mb-4">No analytics data available for this patient</p>
                        <p className="text-gray-500">Patient needs to start chatting to see analytics.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                    <div className="space-y-12">
                      {/* Key Metrics */}
                      <AnalyticsMetrics 
                        totalEntries={selectedPatientData.analyses?.length || 0}
                        averageAnxiety={selectedPatientData.analyses?.reduce((sum: number, a: any) => sum + (a.anxietyLevel || 0), 0) / (selectedPatientData.analyses?.length || 1)}
                        mostCommonTrigger={processTriggerData(selectedPatientData.analyses || [])[0]}
                      />

                      {/* 1️⃣ Anxiety Type Trends Over Time */}
                      <div className="w-full">
                        <AnxietyChartsSection 
                          triggerData={processTriggerData(selectedPatientData.analyses || [])}
                          severityDistribution={[]}
                          analyses={selectedPatientData.analyses || []}
                          showOnly="trends"
                        />
                      </div>

                      {/* 2️⃣ Anxiety Levels Distribution */}
                      <div className="w-full">
                        <AnxietyChartsSection 
                          triggerData={[]}
                          severityDistribution={processSeverityDistribution(selectedPatientData.analyses || [])}
                          analyses={selectedPatientData.analyses || []}
                          showOnly="distribution"
                        />
                      </div>

                      {/* 3️⃣ Anxiety Level Trends */}
                      <div className="w-full">
                        <TreatmentOutcomes analyses={selectedPatientData.analyses || []} showOnly="trends" />
                      </div>

                      {/* 4️⃣ Monthly Anxiety Trends */}
                      <div className="w-full">
                        <MonthlyChartsSection analyses={selectedPatientData.analyses || []} showOnly="trends" />
                      </div>

                      {/* 5️⃣ Weekly Treatment Outcomes */}
                      <div className="w-full">
                        <TreatmentOutcomes analyses={selectedPatientData.analyses || []} showOnly="outcomes" />
                      </div>

                      {/* 6️⃣ Monthly Session Activity */}
                      <div className="w-full">
                        <MonthlyChartsSection analyses={selectedPatientData.analyses || []} showOnly="activity" />
                      </div>

                      {/* 7️⃣ Goal Progress Section */}
                      <div className="w-full">
                        <GoalProgressSection goals={selectedPatientData.goals || []} />
                      </div>
                    </div>

                    {/* Detailed Trigger Analysis Table */}
                    <TriggerAnalysisTable 
                      triggerData={processTriggerData(selectedPatientData.analyses || [])}
                      totalEntries={selectedPatientData.analyses?.length || 0}
                    />
                    
                    {/* Intervention Summaries Section - Below Clinical Trigger Analysis */}
                    <div className="w-full mt-8">
                      <InterventionSummariesSection 
                        summaries={selectedPatientData.summaries || []}
                        analyses={selectedPatientData.analyses || []}
                      />
                    </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">Please select a patient to view analytics</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6 mt-6">
            {selectedPatientId && selectedPatientData ? (
              <TherapistChatInterface 
                patientId={selectedPatientId}
                patientName={`${selectedPatientData.profile?.first_name || ''} ${selectedPatientData.profile?.last_name || ''}`.trim() || 'Patient'}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Please select a patient to start AI consultation</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="treatment" className="space-y-6 mt-6">
            {selectedPatientId && selectedPatientData ? (
              <TreatmentCreation 
                patientId={selectedPatientId}
                patientName={`${selectedPatientData.profile?.first_name || ''} ${selectedPatientData.profile?.last_name || ''}`.trim() || 'Patient'}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clipboard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Please select a patient to manage treatment plans</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <TherapistNotifications therapistEmail={therapistEmail || user?.email || ''} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Report generation features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TherapistDashboard;