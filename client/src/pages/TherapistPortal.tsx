import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Search, Calendar, TrendingUp, Activity, Target, MessageSquare } from 'lucide-react';
// Removed: useAnalyticsData and useGoalsData - these fetch therapist data, not patient data
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import AnxietyChartsSection from '@/components/analytics/AnxietyChartsSection';
import MonthlyChartsSection from '@/components/analytics/MonthlyChartsSection';
import GoalProgressSection from '@/components/analytics/GoalProgressSection';
import TriggerAnalysisTable from '@/components/analytics/TriggerAnalysisTable';
import TreatmentOutcomes from '@/components/TreatmentOutcomes';
import InterventionSummariesSection from '@/components/analytics/InterventionSummariesSection';
import { ClaudeAnxietyAnalysisWithDate } from '@/services/analyticsService';
import { processTriggerData, processSeverityDistribution, getAnalyticsMetrics } from '@/utils/analyticsDataProcessor';

interface PatientConnection {
  id: string;
  user_id: string;
  therapist_name: string;
  contact_value: string;
  notes?: string;
  created_at: string;
  patient_profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

const TherapistPortal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [therapistEmail, setTherapistEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patients, setPatients] = useState<PatientConnection[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleTherapistLogin = async () => {
    if (!therapistEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // For now, allow any email - role verification will be added after migration
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the therapist portal",
      });
    } catch (error) {
      console.error('Error checking therapist access:', error);
      toast({
        title: "Error",
        description: "Failed to verify therapist access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async () => {
    if (!searchEmail.trim() && !searchCode.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a patient's email or 6-digit code",
        variant: "destructive"
      });
      return;
    }

    console.log('🔍 THERAPIST SEARCH: Starting patient search with:', {
      searchEmail: searchEmail.trim(),
      searchCode: searchCode.trim(),
      therapistEmail,
      timestamp: new Date().toISOString()
    });

    setSearchLoading(true);
    try {
      // Use API endpoint instead of direct Supabase call
      const searchParams = new URLSearchParams();
      if (searchEmail.trim()) {
        searchParams.append('email', searchEmail.toLowerCase());
      } else if (searchCode.trim()) {
        searchParams.append('code', searchCode.trim());
      }
      
      const response = await fetch(`/api/therapist/search-patient?${searchParams}`);
      if (!response.ok) throw new Error('Failed to search patients');
      
      const profiles = await response.json();

      console.log('🔍 THERAPIST SEARCH: Query result:', {
        profiles,
        profilesCount: profiles?.length || 0
      });

      if (!profiles || profiles.length === 0) {
        console.log('🔍 THERAPIST SEARCH: No patients found');
        toast({
          title: "No Patients Found",
          description: "No patients found with the provided search criteria",
          variant: "destructive"
        });
        setPatients([]);
        return;
      }

      // Only show patient role users
      const patientProfiles = (profiles ?? []).filter((p: any) => p.role === 'patient');
      
      console.log('🔍 THERAPIST SEARCH: Filtered patient profiles:', {
        originalCount: profiles.length,
        patientCount: patientProfiles.length,
        filteredProfiles: patientProfiles
      });

      if (patientProfiles.length === 0) {
        console.log('🔍 THERAPIST SEARCH: No patient role users found');
        toast({
          title: "No Patients Found",
          description: "No patients found with the provided search criteria",
          variant: "destructive"
        });
        setPatients([]);
        return;
      }

      // Format as PatientConnection for compatibility
      const formattedPatients = (patientProfiles ?? []).map((profile: any) => ({
        id: profile.id,
        user_id: profile.id,
        therapist_name: therapistEmail,
        contact_value: therapistEmail,
        created_at: new Date().toISOString(),
        patient_profile: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        }
      }));

      console.log('🔍 THERAPIST SEARCH: Formatted patients:', formattedPatients);

      setPatients(formattedPatients);
      toast({
        title: "Search Complete",
        description: `Found ${patientProfiles.length} patient(s)`,
      });
    } catch (error) {
      console.error('🔍 THERAPIST SEARCH ERROR:', error);
      toast({
        title: "Error",
        description: "Failed to search for patients",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Therapist Portal
            </h1>
            <p className="text-gray-600">
              Enter your email to access your patients' progress data
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="therapist-email">Email Address</Label>
              <Input
                id="therapist-email"
                type="email"
                value={therapistEmail}
                onChange={(e) => setTherapistEmail(e.target.value)}
                placeholder="dr.smith@example.com"
                onKeyPress={(e) => e.key === 'Enter' && handleTherapistLogin()}
              />
            </div>
            <Button 
              onClick={handleTherapistLogin} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Access Portal'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Note:</strong> Enter any email address that patients have used to connect with you.
              This portal shows the same analytics and outcomes that patients see in their app.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Therapist Portal</h1>
            <p className="text-gray-600">Logged in as: {therapistEmail}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAuthenticated(false);
              setSelectedPatientId(null);
              setTherapistEmail('');
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Patient List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Search Patients
              </h2>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <Label htmlFor="search-email">Patient Email</Label>
                <Input
                  id="search-email"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="patient@example.com"
                />
              </div>
              <div>
                <Label htmlFor="search-code">Patient Code</Label>
                <Input
                  id="search-code"
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="6-digit code from email"
                  maxLength={6}
                />
              </div>
              <Button 
                onClick={searchPatients} 
                className="w-full"
                disabled={searchLoading}
              >
                {searchLoading ? 'Searching...' : 'Search Patients'}
              </Button>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Results ({patients.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {(patients ?? []).map((patient) => {
                console.log('🔍 PATIENT DISPLAY DATA:', {
                  patient,
                  patient_profile: patient.patient_profile,
                  first_name: patient.patient_profile?.first_name,
                  last_name: patient.patient_profile?.last_name,
                  email: patient.patient_profile?.email
                });
                
                // Build name from first and last name
                let patientName = '';
                if (patient.patient_profile?.first_name || patient.patient_profile?.last_name) {
                  patientName = `${patient.patient_profile.first_name || ''} ${patient.patient_profile.last_name || ''}`.trim();
                }
                
                // If no name, use email
                if (!patientName && patient.patient_profile?.email) {
                  patientName = patient.patient_profile.email;
                }
                
                // Final fallback
                if (!patientName) {
                  patientName = 'Patient (No Name Available)';
                }
                
                const isSelected = selectedPatientId === patient.user_id;
                
                return (
                  <Card 
                    key={patient.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      console.log('🔍 SELECTING PATIENT:', patient.user_id, patientName);
                      setSelectedPatientId(patient.user_id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patientName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Connected {new Date(patient.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {patient.user_id}
                        </p>
                        {patient.notes && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {patient.notes}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {selectedPatientId ? (
            <PatientAnalytics patientId={selectedPatientId} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Patient
              </h3>
              <p className="text-gray-500">
                Choose a patient from the sidebar to view their analytics and progress
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate goal completion rate
const calculateGoalCompletionRate = (goal: any): number => {
  if (!goal.goal_progress || goal.goal_progress.length === 0) return 0;
  
  const today = new Date();
  const startDate = new Date(goal.start_date);
  const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let expectedEntries: number;
  switch (goal.frequency) {
    case 'daily':
      expectedEntries = Math.max(1, daysSinceStart);
      break;
    case 'weekly':
      expectedEntries = Math.max(1, Math.ceil(daysSinceStart / 7));
      break;
    case 'monthly':
      expectedEntries = Math.max(1, Math.ceil(daysSinceStart / 30));
      break;
    default:
      expectedEntries = 1;
  }
  
  const actualEntries = goal.goal_progress.length;
  return Math.min(100, (actualEntries / expectedEntries) * 100);
};

// Component to show patient analytics - ISOLATED PATIENT DATA ONLY
const PatientAnalytics: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const therapistEmail = user?.email;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 FETCHING PATIENT DATA FOR:', patientId);
        
        // Clear all previous data first to ensure no contamination
        setPatientProfile(null);
        setAnalyses([]);
        setMessages([]);
        setGoals([]);
        setSummaries([]);
        
        // Use server endpoint for therapist analytics (Option A - recommended)
        const url = `/api/therapist/patient-analytics?patientId=${encodeURIComponent(patientId)}&therapistEmail=${encodeURIComponent(therapistEmail || '')}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Therapist analytics fetch failed: ${res.status}`);
        const payload = await res.json();
        
        console.log('🔍 RAW FETCH RESULTS FOR PATIENT', patientId, {
          profile: payload.profile,
          analysesCount: payload.analyses?.length || 0,
          messagesCount: payload.messages?.length || 0,
          goalsCount: payload.goals?.length || 0,
          summariesCount: payload.summaries?.length || 0,
          rawAnalyses: payload.analyses,
          rawGoals: payload.goals,
          rawSummaries: payload.summaries
        });
        
        console.log('🔍 DETAILED DEBUG - ANALYSES FOR PATIENT:', patientId);
        console.log('🔍 Analyses Data Sample:', payload.analyses?.slice(0, 3));
        
        console.log('🔍 DETAILED DEBUG - GOALS FOR PATIENT:', patientId);
        console.log('🔍 Goals Data:', payload.goals);
        
        setPatientProfile(payload.profile ?? null);

        // ⚠️ Normalize minimally and KEEP IDENTIFIERS
        // Helper function to handle PostgreSQL arrays
        const toArray = (v: unknown) =>
          Array.isArray(v)
            ? v
            : typeof v === 'string'
              ? v
                  .replace(/^\{|\}$/g, '')     // handle Postgres '{a,b}' form
                  .split(',')                  // split by comma
                  .map(s => s.replace(/^"|"$/g, '').trim())
                  .filter(Boolean)
              : [];

        const processedAnalyses = (payload.analyses ?? []).map((a: any) => ({
          id: a.id ?? `${a.user_id}-${a.created_at}`,
          user_id: a.user_id || a.userId,                       // ✅ keep it
          anxietyLevel: a.anxiety_level || a.anxietyLevel,
          anxietyTriggers: a.anxietyTriggers || a.anxiety_triggers, // Keep both camelCase and snake_case
          copingStrategies: a.copingStrategies || a.coping_strategies, // Keep both formats
          patient_message: a.patient_message, // Keep patient message
          createdAt: a.createdAt || a.created_at, // Keep timestamp in both formats
          gad7Score: Math.round((a.anxiety_level || a.anxietyLevel || 0) * 2.1),
          triggers: Array.isArray(a.anxietyTriggers || a.anxiety_triggers)
            ? (a.anxietyTriggers || a.anxiety_triggers)
            : typeof (a.anxietyTriggers || a.anxiety_triggers) === 'string' && (a.anxietyTriggers || a.anxiety_triggers).startsWith('{')
              ? (a.anxietyTriggers || a.anxiety_triggers)
                  .slice(1, -1) // Remove { and }
                  .split('","') // Split by ","
                  .map((s: string) => s.replace(/^"|"$/g, '')) // Remove quotes
              : typeof (a.anxietyTriggers || a.anxiety_triggers) === 'string'
              ? (a.anxietyTriggers || a.anxiety_triggers).split(',').map((s: string) => s.trim()).filter(Boolean)
              : [],
          dsm5Indicators: Array.isArray(a.anxiety_triggers) ? a.anxiety_triggers : [],
          cognitiveDistortions: [],
          recommendedInterventions: Array.isArray(a.coping_strategies)
            ? a.coping_strategies
            : typeof a.coping_strategies === 'string' && a.coping_strategies.startsWith('{')
              ? a.coping_strategies
                  .slice(1, -1) // Remove { and }
                  .split('","') // Split by ","
                  .map((s: string) => s.replace(/^"|"$/g, '')) // Remove quotes
              : typeof a.coping_strategies === 'string'
              ? a.coping_strategies.split(',').map((s: string) => s.trim()).filter(Boolean)
              : [],
          therapyApproach: 'CBT' as const,
          crisisRiskLevel: (a.anxiety_level >= 9 ? 'critical' :
                           a.anxiety_level >= 7 ? 'high' :
                           a.anxiety_level >= 5 ? 'moderate' : 'low') as 'low' | 'moderate' | 'high' | 'critical',
          sentiment: (a.anxiety_level >= 8 ? 'crisis' :
                     a.anxiety_level >= 6 ? 'negative' :
                     a.anxiety_level <= 3 ? 'positive' : 'neutral') as 'positive' | 'neutral' | 'negative' | 'crisis',
          escalationDetected: a.anxiety_level >= 8,
          personalizedResponse: a.personalized_response || '',
          created_at: a.created_at
        }));

        const processedGoals = (payload.goals ?? []).map((g: any) => {
          const progressEntries = g.goal_progress || [];
          const avgScore = progressEntries.length
            ? progressEntries.reduce((sum: number, p: any) => sum + (p.score ?? 0), 0) / progressEntries.length
            : 0;
          return {
            ...g,
            progress_history: progressEntries,
            average_score: avgScore,
            completion_rate: calculateGoalCompletionRate(g),
            latest_progress: progressEntries[0] || null,
          };
        });

        const normalizeSummary = (s: any, fallbackUserId: string) => {
          const userId = s.user_id || s.userId || fallbackUserId;

          const weekStart = s.week_start || s.weekStart || s.start || s.startDate || s.dateRangeStart;
          const weekEnd   = s.week_end   || s.weekEnd   || s.end   || s.endDate   || s.dateRangeEnd;

          const interventionType   = s.intervention_type || s.interventionType || s.type || 'unknown';
          const conversationCountN = Number(s.conversation_count ?? s.conversationCount ?? 0);

          const keyPts = toArray(s.key_points ?? s.keyPoints);
          const recs   = toArray(s.recommendations);
          const lims   = toArray(s.limitations ?? s.limitation_points);

          const createdAt = s.created_at || s.createdAt || weekEnd || weekStart || new Date().toISOString();

          return {
            // snake_case (backend style)
            id: String(s.id ?? `${userId}-${weekStart ?? Date.now()}`),
            user_id: userId,
            week_start: weekStart,
            week_end: weekEnd,
            intervention_type: interventionType,
            conversation_count: conversationCountN,
            key_points: keyPts,
            recommendations: recs,
            limitations: lims,
            created_at: createdAt,

            // camelCase (component-friendly)
            userId,
            weekStart,
            weekEnd,
            interventionType,
            conversationCount: conversationCountN,
            keyPoints: keyPts,
            createdAt,
          };
        };

        setPatientProfile(payload.profile ?? null);
        setAnalyses(processedAnalyses);         // ✅ scoped to this patient already
        setMessages(payload.messages ?? []);
        setGoals(processedGoals);
        
        // Handle different API response shapes
        const rawSummaries = 
          payload.summaries ?? 
          payload.interventions ?? 
          payload.interventionSummaries ?? [];
        
        console.log('🔍 Summaries Debug:', {
          'payload.summaries': payload.summaries,
          'payload.summaries?.length': payload.summaries?.length,
          'First summary': payload.summaries?.[0],
          'rawSummaries.length': rawSummaries.length,
          'normalized': rawSummaries.map((s: any) => normalizeSummary(s, patientId))
        });
        
        // 👇 ensure user_id is present and both casings exist
        const normalizedSummaries = rawSummaries.map((s: any) => normalizeSummary(s, patientId));
        setSummaries(normalizedSummaries);
        
        console.log('➡️ InterventionSummariesSection props:', {
          count: rawSummaries.length,
          first: rawSummaries[0],
          normalizedFirst: rawSummaries[0] && normalizeSummary(rawSummaries[0], patientId),
        });
        
        console.log('✅ Summaries set in state:', normalizedSummaries);
        
        // Add window debug for easier inspection
        if (typeof window !== 'undefined') {
          (window as any).__DEBUG_SUMMARIES = {
            raw: rawSummaries,
            normalized: normalizedSummaries,
            patientId
          };
          console.log('🔍 Debug data available in console: window.__DEBUG_SUMMARIES');
        }

        // Log for one-screen sanity checklist
        console.log('✅ FIRST ANALYSIS', processedAnalyses[0]);
        console.log('✅ FIRST SUMMARY', (payload.summaries ?? [])[0]);

        console.log('🔥 STATE SET COMPLETE - analyses should now be:', processedAnalyses.length);

      } catch (error) {
        console.error('🚨 CRITICAL ERROR in fetchPatientData:', error);
        console.error('🚨 Error details:', (error as Error).message, (error as Error).stack);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive"
        });
      } finally {
        console.log('🔥 FINALLY BLOCK - Setting loading to false');
        setLoading(false);
      }
    };

    console.log('🔥 CALLING fetchPatientData for patient:', patientId);
    fetchPatientData();
  }, [patientId]);

  // Helper functions for downloading reports
  const handleDownloadHistory = async () => {
    try {
      // Create a simple text-based report for now
      let reportText = `Patient Analytics Report for ${patientName}\n\n`;
      reportText += `Generated: ${new Date().toLocaleDateString()}\n\n`;
      reportText += `Total Sessions: ${totalEntries}\n`;
      reportText += `Average Anxiety Level: ${avgAnxiety.toFixed(1)}/10\n`;
      reportText += `Most Common Trigger: ${mostCommonTrigger[0]} (${mostCommonTrigger[1]} times)\n\n`;
      
      if (hasAnalysesData) {
        reportText += "Recent Anxiety Data:\n";
        (analyses ?? []).slice(0, 20).forEach((analysis, index) => {
          reportText += `${index + 1}. ${new Date(analysis.created_at).toLocaleDateString()}: Level ${analysis.anxietyLevel}/10\n`;
          if (analysis.triggers && analysis.triggers.length > 0) {
            reportText += `   Triggers: ${analysis.triggers.join(', ')}\n`;
          }
        });
      }

      // Create blob and download
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patientName.replace(/\s+/g, '_')}_analytics_report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Patient analytics report download initiated",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download patient history",
        variant: "destructive"
      });
    }
  };

  const handleDownloadSummary = async () => {
    try {
      // Generate conversation summary from messages
      let summaryText = `Patient Conversation Summary for ${patientName}\n\n`;
      summaryText += `Total Messages: ${messages.length}\n`;
      summaryText += `Anxiety Sessions: ${analyses.length}\n`;
      summaryText += `Average Anxiety Level: ${avgAnxiety.toFixed(1)}/10\n\n`;
      
      if (messages.length > 0) {
        summaryText += "Recent Conversations:\n";
        const recentMessages = (messages ?? []).slice(0, 10);
        (recentMessages ?? []).forEach((msg, index) => {
          summaryText += `${index + 1}. ${new Date(msg.created_at).toLocaleDateString()}: ${msg.content.substring(0, 100)}...\n`;
        });
      }

      // Create blob and download
      const blob = new Blob([summaryText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patientName.replace(/\s+/g, '_')}_conversation_summary.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started", 
        description: "Conversation summary download initiated",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download conversation summary",
        variant: "destructive"
      });
    }
  };

  console.log('🔥 PatientAnalytics RENDER - Patient ID:', patientId);
  console.log('🔥 PatientAnalytics RENDER - Analyses count:', analyses.length);
  console.log('🔥 PatientAnalytics RENDER - Goals count:', goals.length);
  console.log('🔥 PatientAnalytics RENDER - Loading state:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Don't return early for no analyses - still show patient info
  const hasAnalysesData = analyses.length > 0;

  // Calculate analytics metrics only if we have data
  const totalEntries = hasAnalysesData ? analyses.length : 0;
  const avgAnxiety = (analyses?.length
    ? analyses.reduce((sum, a) => sum + (a.anxietyLevel ?? 0), 0) / analyses.length
    : 0);
  const allTriggers = hasAnalysesData ? analyses.flatMap(a => a.triggers || []) : [];
  const triggerCounts = (allTriggers ?? []).reduce((acc, trigger) => {
    acc[trigger] = (acc[trigger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommonTrigger = Object.entries(triggerCounts ?? {})
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];

  console.log('🔍 DEBUG: Patient Analytics Data Processing for patient:', patientId);
  console.log('🔍 DEBUG: Raw analyses count:', analyses.length);
  console.log('🔍 DEBUG: Raw goals count:', goals.length);
  console.log('DEBUG first 2:', (analyses ?? []).slice(0, 2));
  console.log('🔍 DEBUG: Raw goals data:', goals);
  
  // Downstream: use the same array for charts & KPIs
  const isolatedPatientAnalyses = analyses; // ✅ no re-filter
  const isolatedPatientGoals = goals; // ✅ no re-filter
  
  console.log('🔍 DEBUG: Isolated analyses count:', isolatedPatientAnalyses.length);
  console.log('🔍 DEBUG: Isolated goals count:', isolatedPatientGoals.length);
  console.log('🔍 DEBUG: Patient ID filter:', patientId);
  console.log('All analyses user IDs:', Array.from(new Set((analyses ?? []).map(a => a.user_id))));
  console.log('Isolated analyses user IDs:', Array.from(new Set((isolatedPatientAnalyses ?? []).map(a => a.user_id))));
  
  // Use the SAME data processing as the Analytics page
  const triggerData = processTriggerData(isolatedPatientAnalyses);
  const severityDistribution = processSeverityDistribution(isolatedPatientAnalyses);
  
  console.log('🔍 DEBUG: Processed trigger data:', triggerData);
  console.log('🔍 DEBUG: Trigger data count:', triggerData.length);


  const patientName = patientProfile ? 
    `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim() || 'Patient' : 
    'Patient';

  return (
    <div className="space-y-8">
      {/* Patient Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patientName} - Analytics</h2>
            <p className="text-gray-600">{patientProfile?.email}</p>
          </div>
        </div>
        <Badge variant="secondary">
          Patient ID: {patientId.substring(0, 8)}
        </Badge>
      </div>

      {/* Analytics Header with Download Options */}
      <AnalyticsHeader 
        analysesCount={analyses.length}
        onDownloadHistory={handleDownloadHistory}
        onShareWithTherapist={() => {}} // Not applicable for therapist view
        onDownloadSummary={handleDownloadSummary}
      />
      
      {hasAnalysesData ? (
        <>
          {/* Analytics Metrics */}
          <AnalyticsMetrics 
            totalEntries={totalEntries}
            averageAnxiety={avgAnxiety}
            mostCommonTrigger={{ 
              trigger: mostCommonTrigger[0] as string,
              count: mostCommonTrigger[1] as number
            }}
          />

          {/* Charts Section - Only patient's data */}
          {console.log('🔥 PASSING TO AnxietyChartsSection:', {
            isolatedPatientAnalysesCount: isolatedPatientAnalyses.length,
            allAnalysesCount: analyses.length,
            patientId,
            firstIsolatedAnalysis: isolatedPatientAnalyses[0],
            firstAllAnalysis: analyses[0]
          })}
          <AnxietyChartsSection 
            triggerData={triggerData}
            severityDistribution={severityDistribution}
            analyses={isolatedPatientAnalyses}
          />

          {/* Monthly Charts Section - Only patient's data */}
          <MonthlyChartsSection 
            analyses={isolatedPatientAnalyses}
          />

          {/* Treatment Outcomes - Only patient's data */}
          <TreatmentOutcomes 
            analyses={isolatedPatientAnalyses}
          />

          {/* Trigger Analysis Table - Only patient's data */}
          <TriggerAnalysisTable 
            triggerData={triggerData}
            totalEntries={totalEntries}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Anxiety Data Yet
          </h3>
          <p className="text-gray-500">
            This patient hasn't started tracking their anxiety yet. Data will appear here once they begin using the anxiety companion.
          </p>
        </div>
      )}

      {/* Intervention Summaries - Always show the component */}
      {(() => {
        console.log('🎯 THERAPIST PORTAL - Rendering Intervention Section:', {
          'patientId': patientId,
          'summaries.length': summaries?.length,
          'summaries': summaries,
          'first summary': summaries?.[0],
          'analyses.length': isolatedPatientAnalyses?.length,
          'hasAnalysesData': hasAnalysesData,
          'loading': loading
        });
        return null;
      })()}
      
      <InterventionSummariesSection 
        summaries={summaries || []}
        analyses={isolatedPatientAnalyses || []}
      />

      {/* Goal Progress Section - Show even if no anxiety data */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">Goal Progress Overview</h3>
        </div>
        
        {goals.length > 0 ? (
          <GoalProgressSection 
            goals={isolatedPatientGoals}
          />
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-gray-500">No goals set yet</p>
          </div>
        )}

      </div>

      {/* Therapist Note */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Therapist Note:</strong> This view shows the same analytics and treatment outcomes 
          that your patient sees in their mobile app. Data is updated in real-time as the patient 
          interacts with the anxiety companion.
        </p>
      </div>
    </div>
  );
};

export default TherapistPortal;