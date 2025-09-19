
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Target, 
  Brain, 
  Heart,
  Phone,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import TreatmentOutcomes from '@/components/TreatmentOutcomes';
import { GoalTracker } from '@/components/goals/GoalTracker';
import InterventionSummariesSection from '@/components/analytics/InterventionSummariesSection';
import { interventionSummaryService } from '@/services/interventionSummaryService';
import { useGoalsData } from '@/hooks/useGoalsData';
import { useToast } from '@/hooks/use-toast';

const TreatmentResources = () => {
  const { data, getAllAnalyses } = useAnalyticsData();
  const summariesData = useGoalsData();
  const { summaries } = summariesData;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summariesGenerated, setSummariesGenerated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const allAnalyses = getAllAnalyses();

  // Auto-generate summaries when component mounts and we have analyses
  useEffect(() => {
    const generateSummariesOnLoad = async () => {
      if (allAnalyses.length > 0 && !summariesGenerated) {
        try {
          console.log('🚀 Auto-generating intervention summaries...');
          // Generate summaries placeholder - implement actual service method
          console.log('Generating intervention summaries...');
          await summariesData.refetch();
          setSummariesGenerated(true);
          console.log('✅ Summaries generated and refetched');
        } catch (error) {
          console.error('❌ Error auto-generating summaries:', error);
        }
      }
    };

    generateSummariesOnLoad();
  }, [allAnalyses.length, summariesGenerated, summariesData]);

  const treatmentOptions = [
    {
      id: 'cbt',
      title: 'Cognitive Behavioral Therapy (CBT)',
      description: 'Evidence-based therapy focusing on changing thought patterns and behaviors',
      category: 'therapy',
      effectiveness: 'high',
      duration: '12-20 sessions',
      icon: Brain,
      recommended: true
    },
    {
      id: 'dbt',
      title: 'Dialectical Behavior Therapy (DBT)',
      description: 'Skills-based therapy for emotional regulation and distress tolerance',
      category: 'therapy',
      effectiveness: 'high',
      duration: '6 months - 1 year',
      icon: Heart,
      recommended: false
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness-Based Stress Reduction',
      description: 'Meditation and mindfulness practices to reduce anxiety and stress',
      category: 'self-help',
      effectiveness: 'moderate',
      duration: '8-12 weeks',
      icon: Target,
      recommended: true
    },
    {
      id: 'support-group',
      title: 'Anxiety Support Groups',
      description: 'Peer support and shared experiences with anxiety management',
      category: 'support',
      effectiveness: 'moderate',
      duration: 'Ongoing',
      icon: Users,
      recommended: false
    }
  ];

  const resources = [
    {
      title: 'Anxiety and Depression Workbook',
      type: 'book',
      description: 'Self-help workbook with practical exercises',
      url: '#'
    },
    {
      title: 'Headspace: Meditation App',
      type: 'app',
      description: 'Guided meditation and mindfulness exercises',
      url: '#'
    },
    {
      title: 'Crisis Text Line',
      type: 'helpline',
      description: '24/7 support via text message',
      phone: '741741'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'therapy', label: 'Professional Therapy' },
    { id: 'self-help', label: 'Self-Help' },
    { id: 'support', label: 'Support Groups' }
  ];

  const filteredTreatments = selectedCategory === 'all' 
    ? treatmentOptions 
    : treatmentOptions.filter(t => t.category === selectedCategory);

  const connectToTherapist = () => {
    // Navigate to Contact Therapist tab as requested
    navigate('/contact-therapist');
  };

  const hasActiveTreatment = false; // This would come from user data

  const handleDownloadSummary = async () => {
    try {
      console.log('🔄 Starting download summary...');
      console.log('📊 Current analyses count:', allAnalyses.length);
      console.log('📋 Current summaries count:', summaries.length);
      
      // Use the summary report service to download as PDF-like format
      const { downloadSummaryReport } = await import('@/services/summaryReportService');
      downloadSummaryReport(summaries, summariesData.goals || [], allAnalyses);
      
      toast({
        title: "Success",
        description: "Conversation summary downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading summary:', error);
      toast({
        title: "Error", 
        description: "Failed to download conversation summary",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Track Outcomes & Treatment</h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor your progress, track goals, and access evidence-based treatments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleDownloadSummary} variant="outline" size="sm" disabled={allAnalyses.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Download Conversation Summary
              </Button>
              <Button onClick={connectToTherapist} className="bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Connect with Therapist
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Treatment Status */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            {hasActiveTreatment ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Active Treatment Plan</h3>
                  <p className="text-gray-600">You're currently following a CBT treatment plan</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">No Active Treatment</h3>
                  <p className="text-gray-600">Based on your anxiety patterns, we recommend starting with professional therapy</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/assessment')}>
                    Take Assessment
                  </Button>
                  <Button onClick={connectToTherapist}>
                    Find Therapist
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Goal Tracker - Track Outcome Measures */}
        <div className="mb-8">
          <GoalTracker />
        </div>

        {/* Treatment Outcomes */}
        <div className="mb-8">
          <TreatmentOutcomes analyses={allAnalyses} />
        </div>

        {/* Weekly Intervention Summaries Section */}
        <div className="mb-8 w-full">
          <InterventionSummariesSection summaries={summaries} analyses={allAnalyses} />
        </div>

        {/* Treatment Options */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recommended Treatment Options</h3>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Treatment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTreatments.map(treatment => {
              const IconComponent = treatment.icon;
              return (
                <Card key={treatment.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{treatment.title}</h4>
                        {treatment.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Duration: {treatment.duration}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          treatment.effectiveness === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {treatment.effectiveness} effectiveness
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                        onClick={() => navigate('/chat', { 
                          state: { 
                            initialMessage: `Tell me more about ${treatment.title} and how it can help with my anxiety. I'd like to understand the process, what to expect, and if it's right for me.` 
                          } 
                        })}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default TreatmentResources;
