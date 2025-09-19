import { useState } from 'react';
import { ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';
import { FallbackAnxietyAnalysis } from '@/utils/anxiety/types';

interface SuggestedGoal {
  title: string;
  description: string;
  category: 'treatment' | 'self-care' | 'therapy' | 'mindfulness' | 'exercise' | 'social' | 'work' | 'sleep' | 'nutrition';
  target_value: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reason: string;
}

export const useGoalSuggestions = () => {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestedGoals, setSuggestedGoals] = useState<SuggestedGoal[]>([]);

  const shouldSuggestGoals = (
    message: string, 
    analysis: ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis | null
  ): boolean => {
    const lowerMessage = message.toLowerCase();
    
    console.log('🎯 Checking goal suggestions for message:', message);
    console.log('🎯 Analysis:', analysis);
    
    // Driving-specific anxiety triggers (high priority)
    const drivingKeywords = [
      'driving', 'drive', 'car', 'vehicle', 'road', 'traffic',
      'highway', 'license', 'behind the wheel', 'steering wheel'
    ];
    
    const anxietyKeywords = [
      'anxious', 'worried', 'fear', 'scared', 'panic', 'stress',
      'overwhelmed', 'nervous', 'afraid', 'tense', 'restless',
      'hate', 'can\'t', 'unable', 'stuck', 'constrained', 'limited'
    ];
    
    const strugglingLanguage = [
      'struggling', 'difficult', 'hard', 'challenging', 'problem',
      'issue', 'trouble', 'can\'t do', 'taking toll', 'affecting'
    ];
    
    // Check for explicit goal mentions
    const hasGoalKeywords = lowerMessage.includes('goal') || 
                           lowerMessage.includes('target') || 
                           lowerMessage.includes('achieve') ||
                           lowerMessage.includes('improve') ||
                           lowerMessage.includes('work on') ||
                           lowerMessage.includes('get better') ||
                           lowerMessage.includes('help me') ||
                           lowerMessage.includes('want to') ||
                           lowerMessage.includes('need to');

    const hasDrivingContent = drivingKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasAnxietyKeywords = anxietyKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasStrugglingLanguage = strugglingLanguage.some(keyword => lowerMessage.includes(keyword));

    // Driving anxiety should always trigger goals
    const drivingAnxiety = hasDrivingContent && (hasAnxietyKeywords || hasStrugglingLanguage);
    
    // High anxiety that could benefit from goal setting
    const hasHighAnxiety = analysis && analysis.anxietyLevel >= 5;
    
    // Struggling with life impacts
    const strugglingWithImpact = hasStrugglingLanguage && hasAnxietyKeywords;
    
    // Check for specific triggers that goals could help with
    const hasWorkableTrigggers = analysis && analysis.triggers && 
                               analysis.triggers.some(trigger => 
                                 ['social', 'work', 'health', 'relationships', 'performance', 'driving'].includes(trigger.toLowerCase())
                               );

    console.log('🎯 Detection results:', {
      drivingAnxiety,
      hasGoalKeywords,
      hasHighAnxiety,
      strugglingWithImpact,
      hasWorkableTrigggers,
      anxietyLevel: analysis?.anxietyLevel
    });
    
    return drivingAnxiety || 
           hasGoalKeywords || 
           strugglingWithImpact ||
           (hasHighAnxiety && hasWorkableTrigggers);
  };

  const generateGoalSuggestions = (
    message: string,
    analysis: ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis | null
  ): SuggestedGoal[] => {
    const suggestions: SuggestedGoal[] = [];
    const lowerMessage = message.toLowerCase();

    // Driving anxiety specific goals (highest priority)
    const drivingKeywords = ['driving', 'drive', 'car', 'vehicle', 'road', 'traffic'];
    const hasDrivingContent = drivingKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasDrivingContent) {
      suggestions.push({
        title: 'Driving Exposure Therapy',
        description: 'Start with 5 minutes sitting in parked car, progress to engine on, then short drives',
        category: 'therapy',
        target_value: 10,
        unit: 'minutes',
        frequency: 'daily',
        reason: 'Gradual exposure is the most effective treatment for driving phobia - builds confidence step by step'
      });
      
      suggestions.push({
        title: 'Driving Visualization Practice',
        description: 'Visualize calm, successful driving experiences to reduce anticipatory anxiety',
        category: 'mindfulness',
        target_value: 5,
        unit: 'minutes',
        frequency: 'daily',
        reason: 'Mental rehearsal helps your brain practice success and reduces fear responses'
      });
      
      suggestions.push({
        title: 'Transportation Independence Plan',
        description: 'Explore rideshare, public transit, and social options while working on driving goals',
        category: 'social',
        target_value: 2,
        unit: 'outings',
        frequency: 'weekly',
        reason: 'Maintaining social connections prevents isolation while addressing driving anxiety'
      });
      
      // Return driving-specific goals immediately
      return suggestions;
    }

    // Social anxiety goals (dating, socializing mentioned)
    if (lowerMessage.includes('social') || lowerMessage.includes('date') || lowerMessage.includes('dating') || 
        analysis?.triggers?.some(t => t.toLowerCase().includes('social'))) {
      suggestions.push({
        title: 'Social Confidence Building',
        description: 'Start with low-pressure social activities - coffee with one friend, group activities',
        category: 'social',
        target_value: 1,
        unit: 'activity',
        frequency: 'weekly',
        reason: 'Building social confidence step by step helps overcome isolation and improves dating prospects'
      });
    }

    // High anxiety management goals
    if (analysis && analysis.anxietyLevel >= 6) {
      suggestions.push({
        title: 'Anxiety Tracking & Management',
        description: 'Track anxiety levels, triggers, and what helps - identify your personal patterns',
        category: 'self-care',
        target_value: 1,
        unit: 'entry',
        frequency: 'daily',
        reason: 'Understanding your anxiety patterns is the first step to managing them effectively'
      });

      suggestions.push({
        title: 'Progressive Muscle Relaxation',
        description: 'Practice tensing and releasing muscle groups to reduce physical anxiety symptoms',
        category: 'mindfulness',
        target_value: 15,
        unit: 'minutes',
        frequency: 'daily',
        reason: 'Physical relaxation techniques directly address the body tension that comes with high anxiety'
      });
    } else if (analysis && analysis.anxietyLevel >= 4) {
      suggestions.push({
        title: 'Daily Breathing Practice',
        description: 'Use 4-7-8 breathing technique when you notice anxiety rising',
        category: 'mindfulness',
        target_value: 3,
        unit: 'sessions',
        frequency: 'daily',
        reason: 'Controlled breathing immediately calms your nervous system and is available anywhere'
      });
    }

    // Work stress goals
    if (analysis?.triggers?.some(t => t.toLowerCase().includes('work')) || lowerMessage.includes('work')) {
      suggestions.push({
        title: 'Workplace Stress Management',
        description: 'Practice grounding techniques and mini-breaks during stressful work moments',
        category: 'work',
        target_value: 3,
        unit: 'techniques',
        frequency: 'daily',
        reason: 'Work stress compounds other anxieties - managing it helps overall mental health'
      });
    }

    // General life impact goals
    if (lowerMessage.includes('constrained') || lowerMessage.includes('stuck') || 
        lowerMessage.includes('can\'t') || lowerMessage.includes('unable')) {
      suggestions.push({
        title: 'Small Victory Tracking',
        description: 'Celebrate one small accomplishment each day, no matter how minor',
        category: 'self-care',
        target_value: 1,
        unit: 'victory',
        frequency: 'daily',
        reason: 'When anxiety makes you feel stuck, recognizing progress builds momentum for bigger changes'
      });
    }

    // Exercise goals for anxiety (general mental health)
    if (analysis && analysis.anxietyLevel >= 4 && suggestions.length < 3) {
      suggestions.push({
        title: 'Gentle Movement Practice',
        description: 'Take a 10-minute walk or do gentle stretching to boost mood naturally',
        category: 'exercise',
        target_value: 10,
        unit: 'minutes',
        frequency: 'daily',
        reason: 'Movement releases endorphins and reduces stress hormones, naturally improving anxiety'
      });
    }

    // Mindfulness goals for overthinking
    if (analysis && (analysis.anxietyLevel >= 5 || analysis.cognitiveDistortions?.length > 0)) {
      suggestions.push({
        title: '5-4-3-2-1 Grounding Practice',
        description: 'When anxious thoughts spiral, name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
        category: 'mindfulness',
        target_value: 2,
        unit: 'sessions',
        frequency: 'daily',
        reason: 'Grounding techniques interrupt anxiety spirals and bring you back to the present moment'
      });
    }

    // Return top 3 most relevant suggestions
    return suggestions.slice(0, 3);
  };

  const triggerGoalSuggestion = (
    message: string,
    analysis: ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis | null
  ) => {
    if (shouldSuggestGoals(message, analysis)) {
      const goals = generateGoalSuggestions(message, analysis);
      if (goals.length > 0) {
        setSuggestedGoals(goals);
        setShowSuggestionModal(true);
        return true; // Indicates that goal suggestion was triggered
      }
    }
    return false;
  };

  const closeSuggestionModal = () => {
    setShowSuggestionModal(false);
    setSuggestedGoals([]);
  };

  return {
    showSuggestionModal,
    suggestedGoals,
    triggerGoalSuggestion,
    closeSuggestionModal
  };
};