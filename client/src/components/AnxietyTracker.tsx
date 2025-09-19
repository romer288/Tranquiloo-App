
import React from 'react';
import { TrendingUp, AlertTriangle, Heart } from 'lucide-react';
import { AnxietyAnalysis, getAnxietyLevelDescription, getAnxietyColor } from '@/utils/anxietyAnalysis';

interface AnxietyTrackerProps {
  currentLevel: number;
  recentAnalyses: AnxietyAnalysis[];
}

const AnxietyTracker: React.FC<AnxietyTrackerProps> = ({ currentLevel, recentAnalyses }) => {
  const averageLevel = Math.round(((recentAnalyses ?? [])
    .reduce((sum, a) => sum + (a.level ?? 0), 0)) /
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-pink-500" />
        <h3 className="font-semibold text-gray-900">Anxiety Tracking</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getAnxietyColor(currentLevel)}`}>
            {currentLevel}/10
          </div>
          <div className="text-sm text-gray-600">Current Level</div>
          <div className={`text-sm font-medium ${getAnxietyColor(currentLevel)}`}>
            {getAnxietyLevelDescription(currentLevel)}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getAnxietyColor(averageLevel)}`}>
            {averageLevel}/10
          </div>
          <div className="text-sm text-gray-600">Session Average</div>
          <div className={`text-sm font-medium ${getAnxietyColor(averageLevel)}`}>
            {getAnxietyLevelDescription(averageLevel)}
          </div>
        </div>
      </div>

      {topTriggers.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Detected Triggers:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(topTriggers ?? []).map(([trigger]) => (
              <span
                key={trigger}
                className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full capitalize"
              >
                {trigger}
              </span>
            ))}
          </div>
        </div>
      )}

      {recentAnalyses.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Recent Trend:</span>
          </div>
          <div className="flex gap-1">
            {(recentAnalyses ?? []).slice(-5).map((analysis, index) => (
              <div
                key={index}
                className={`w-3 h-6 rounded-sm ${
                  analysis.level <= 2 ? 'bg-green-400' :
                  analysis.level <= 4 ? 'bg-yellow-400' :
                  analysis.level <= 6 ? 'bg-orange-400' :
                  analysis.level <= 8 ? 'bg-red-400' : 'bg-red-600'
                }`}
                title={`Level: ${analysis.level}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnxietyTracker;
