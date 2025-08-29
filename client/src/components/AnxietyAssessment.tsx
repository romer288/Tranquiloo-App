
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; score: number }[];
  category: 'general' | 'social' | 'panic' | 'phobia' | 'ocd';
}

interface AssessmentProps {
  onComplete: (results: AssessmentResults) => void;
}

interface AssessmentResults {
  overallScore: number;
  anxietyLevel: 'mild' | 'moderate' | 'severe';
  primaryType: string;
  recommendations: string[];
}

const AnxietyAssessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions: AssessmentQuestion[] = [
    {
      id: 'worry_frequency',
      question: 'How often do you experience excessive worry or anxiety?',
      category: 'general',
      options: [
        { value: 'rarely', label: 'Rarely or never', score: 0 },
        { value: 'sometimes', label: 'Sometimes (1-2 times per week)', score: 1 },
        { value: 'often', label: 'Often (3-4 times per week)', score: 2 },
        { value: 'daily', label: 'Daily or almost daily', score: 3 }
      ]
    },
    {
      id: 'physical_symptoms',
      question: 'How often do you experience physical symptoms like rapid heartbeat, sweating, or trembling?',
      category: 'panic',
      options: [
        { value: 'never', label: 'Never', score: 0 },
        { value: 'rarely', label: 'Rarely', score: 1 },
        { value: 'sometimes', label: 'Sometimes', score: 2 },
        { value: 'often', label: 'Often', score: 3 }
      ]
    },
    {
      id: 'social_situations',
      question: 'How comfortable are you in social situations or meeting new people?',
      category: 'social',
      options: [
        { value: 'very_comfortable', label: 'Very comfortable', score: 0 },
        { value: 'somewhat_comfortable', label: 'Somewhat comfortable', score: 1 },
        { value: 'uncomfortable', label: 'Uncomfortable', score: 2 },
        { value: 'very_uncomfortable', label: 'Very uncomfortable or avoid them', score: 3 }
      ]
    },
    {
      id: 'daily_activities',
      question: 'How much does anxiety interfere with your daily activities?',
      category: 'general',
      options: [
        { value: 'not_at_all', label: 'Not at all', score: 0 },
        { value: 'slightly', label: 'Slightly', score: 1 },
        { value: 'moderately', label: 'Moderately', score: 2 },
        { value: 'severely', label: 'Severely', score: 3 }
      ]
    },
    {
      id: 'specific_fears',
      question: 'Do you have intense fears of specific objects or situations?',
      category: 'phobia',
      options: [
        { value: 'no', label: 'No specific fears', score: 0 },
        { value: 'mild', label: 'Some mild fears', score: 1 },
        { value: 'moderate', label: 'Moderate fears that I can manage', score: 2 },
        { value: 'severe', label: 'Severe fears that I avoid', score: 3 }
      ]
    }
  ];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      const results = calculateResults();
      onComplete(results);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = (): AssessmentResults => {
    let totalScore = 0;
    const categoryScores: Record<string, number> = {};

    questions.forEach(question => {
      const answer = answers[question.id];
      const option = question.options.find(opt => opt.value === answer);
      if (option) {
        totalScore += option.score;
        categoryScores[question.category] = (categoryScores[question.category] || 0) + option.score;
      }
    });

    const maxScore = questions.length * 3;
    const percentage = (totalScore / maxScore) * 100;

    let anxietyLevel: 'mild' | 'moderate' | 'severe';
    if (percentage < 33) anxietyLevel = 'mild';
    else if (percentage < 66) anxietyLevel = 'moderate';
    else anxietyLevel = 'severe';

    // Determine primary type
    const primaryType = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';

    const recommendations = getRecommendations(anxietyLevel, primaryType);

    return {
      overallScore: Math.round(percentage),
      anxietyLevel,
      primaryType,
      recommendations
    };
  };

  const getRecommendations = (level: string, type: string): string[] => {
    const baseRecommendations = [
      'Regular exercise and physical activity',
      'Mindfulness and relaxation techniques',
      'Maintaining a consistent sleep schedule'
    ];

    if (level === 'severe') {
      baseRecommendations.unshift('Consider speaking with a mental health professional');
    }

    if (type === 'social') {
      baseRecommendations.push('Gradual exposure to social situations');
    } else if (type === 'panic') {
      baseRecommendations.push('Breathing exercises and grounding techniques');
    }

    return baseRecommendations;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQ.id];

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Anxiety Assessment</h2>
          <span className="text-sm text-gray-600">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {currentQ.question}
        </h3>

        <RadioGroup 
          value={answers[currentQ.id] || ''} 
          onValueChange={handleAnswer}
          className="space-y-3"
        >
          {currentQ.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="text-gray-700 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={nextQuestion}
          disabled={!hasAnswer}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

export default AnxietyAssessment;
