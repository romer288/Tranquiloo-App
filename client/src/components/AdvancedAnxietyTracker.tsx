
import React from 'react';
import { Brain, AlertTriangle, Heart, Activity, Target, Shield } from 'lucide-react';
import { ClaudeAnxietyAnalysis, getGAD7Description, getCrisisRiskColor, getTherapyApproachDescription } from '@/utils/claudeAnxietyAnalysis';

interface AdvancedAnxietyTrackerProps {
  currentAnalysis: ClaudeAnxietyAnalysis;
  recentAnalyses: ClaudeAnxietyAnalysis[];
}

const AdvancedAnxietyTracker: React.FC<AdvancedAnxietyTrackerProps> = ({ 
  currentAnalysis, 
  recentAnalyses 
}) => {
  const averageGAD7 = Math.round(((recentAnalyses ?? [])
    .reduce((sum, a) => sum + (a.gad7Score ?? 0), 0)) /
    Math.max((recentAnalyses ?? []).length, 1));

  const commonTriggers = (recentAnalyses ?? []).flatMap(a => a.triggers ?? [])
    .reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTriggers = Object.entries(commonTriggers ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">Advanced Anxiety Analysis</h3>
      </div>
      
      {/* Crisis Risk Alert */}
      {(currentAnalysis.crisisRiskLevel === 'high' || currentAnalysis.crisisRiskLevel === 'critical') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">
              {currentAnalysis.crisisRiskLevel === 'critical' ? 'Critical Risk Detected' : 'High Risk Detected'}
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Please consider reaching out to a mental health professional or crisis hotline immediately.
          </p>
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {currentAnalysis.anxietyLevel}/10
          </div>
          <div className="text-sm text-gray-600">Anxiety Level</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {currentAnalysis.gad7Score}/21
          </div>
          <div className="text-sm text-gray-600">GAD-7 Score</div>
          <div className="text-xs text-green-700 font-medium">
            {getGAD7Description(currentAnalysis.gad7Score)}
          </div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className={`text-lg font-bold ${getCrisisRiskColor(currentAnalysis.crisisRiskLevel)}`}>
            {currentAnalysis.crisisRiskLevel.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600">Crisis Risk</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-sm font-bold text-purple-600">
            {currentAnalysis.therapyApproach}
          </div>
          <div className="text-sm text-gray-600">Recommended</div>
        </div>
      </div>

      {/* Clinical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* DSM-5 Indicators */}
        {(currentAnalysis?.dsm5Indicators ?? []).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">DSM-5 Indicators:</span>
            </div>
            <div className="space-y-1">
              {(currentAnalysis?.dsm5Indicators ?? []).map((indicator, index) => (
                <div key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {indicator}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beck Anxiety Categories */}
        {(currentAnalysis?.beckAnxietyCategories ?? []).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Beck Categories:</span>
            </div>
            <div className="space-y-1">
              {(currentAnalysis?.beckAnxietyCategories ?? []).map((category, index) => (
                <div key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {category}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cognitive Distortions */}
      {(currentAnalysis?.cognitiveDistortions ?? []).length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Cognitive Patterns Detected:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(currentAnalysis?.cognitiveDistortions ?? []).map((distortion, index) => (
              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                {distortion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Triggers */}
      {(currentAnalysis?.triggers ?? []).length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Current Triggers:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(currentAnalysis?.triggers ?? []).map((trigger, index) => (
              <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full capitalize">
                {trigger}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Interventions */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Recommended Interventions:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(currentAnalysis?.recommendedInterventions ?? []).map((intervention, index) => (
            <div key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              • {intervention}
            </div>
          ))}
        </div>
      </div>

      {/* Therapy Approach Info */}
      <div className="bg-purple-50 rounded-lg p-3">
        <div className="text-sm font-medium text-purple-800 mb-1">
          Recommended Therapeutic Approach: {currentAnalysis.therapyApproach}
        </div>
        <div className="text-xs text-purple-700">
          {getTherapyApproachDescription(currentAnalysis.therapyApproach)}
        </div>
      </div>

      {/* Escalation Warning */}
      {currentAnalysis.escalationDetected && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Anxiety Escalation Detected
            </span>
          </div>
          <p className="text-xs text-orange-700 mt-1">
            Your anxiety levels appear to be increasing. Consider using grounding techniques or reaching out for support.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnxietyTracker;
