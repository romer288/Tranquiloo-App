
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Brain, CheckCircle, AlertTriangle } from 'lucide-react';

interface ClinicalAssessmentProps {
  onComplete: (results: ClinicalAssessmentResult) => void;
}

interface Question {
  id: string;
  category: string;
  question: string;
  options: { value: number; label: string }[];
}

interface ClinicalAssessmentResult {
  scores: Record<string, number>;
  totalScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  recommendations: string[];
  potentialConditions: string[];
}

const ClinicalAssessment: React.FC<ClinicalAssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Research-based clinical assessment combining GAD-7, PHQ-9, PCL-5, and other validated tools
  const questions: Question[] = [
    // GAD-7 (Generalized Anxiety Disorder - 7 item scale)
    {
      id: 'gad7_1',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_2',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_3',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_4',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_5',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been bothered by being so restless that it\'s hard to sit still?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_6',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_7',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    // PHQ-9 (Patient Health Questionnaire - Depression screening)
    {
      id: 'phq9_1',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_2',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_3',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_4',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_5',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_6',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself or that you are a failure or have let yourself or your family down?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_7',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_8',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_9',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    },
    // PCL-5 (PTSD Checklist - shortened version for trauma screening)
    {
      id: 'pcl5_1',
      category: 'trauma',
      question: 'In the past month, how much were you bothered by repeated, disturbing, and unwanted memories of a stressful experience?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]
    },
    {
      id: 'pcl5_2',
      category: 'trauma',
      question: 'In the past month, how much were you bothered by repeated, disturbing dreams of a stressful experience?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]
    },
    {
      id: 'pcl5_3',
      category: 'trauma',
      question: 'In the past month, how much were you bothered by suddenly feeling or acting as if a stressful experience were happening again?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]
    },
    {
      id: 'pcl5_4',
      category: 'trauma',
      question: 'In the past month, how much were you bothered by feeling very upset when something reminded you of a stressful experience?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]
    },
    // Social Anxiety and Panic Disorder screening
    {
      id: 'social_anxiety',
      category: 'social_anxiety',
      question: 'How much do you fear or avoid social situations where you might be judged, embarrassed, or humiliated?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Mild fear/avoidance' },
        { value: 2, label: 'Moderate fear/avoidance' },
        { value: 3, label: 'Severe fear/avoidance' }
      ]
    },
    {
      id: 'panic_attacks',
      category: 'panic',
      question: 'In the past month, have you experienced sudden periods of intense fear or discomfort that reached a peak within minutes?',
      options: [
        { value: 0, label: 'Never' },
        { value: 1, label: '1-2 times' },
        { value: 2, label: '3-5 times' },
        { value: 3, label: 'More than 5 times' }
      ]
    },
    // Functional impairment assessment
    {
      id: 'functional_impairment',
      category: 'functional',
      question: 'How much do these problems interfere with your work, school, social activities, or family relationships?',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Somewhat' },
        { value: 2, label: 'Very much' },
        { value: 3, label: 'Extremely' }
      ]
    }
  ];

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    // Calculate individual scale scores
    const gad7Questions = ['gad7_1', 'gad7_2', 'gad7_3', 'gad7_4', 'gad7_5', 'gad7_6', 'gad7_7'];
    const phq9Questions = ['phq9_1', 'phq9_2', 'phq9_3', 'phq9_4', 'phq9_5', 'phq9_6', 'phq9_7', 'phq9_8', 'phq9_9'];
    const pcl5Questions = ['pcl5_1', 'pcl5_2', 'pcl5_3', 'pcl5_4'];
    
    const gad7Score = gad7Questions.reduce((sum, id) => sum + (answers[id] || 0), 0);
    const phq9Score = phq9Questions.reduce((sum, id) => sum + (answers[id] || 0), 0);
    const pcl5Score = pcl5Questions.reduce((sum, id) => sum + (answers[id] || 0), 0);
    const socialAnxietyScore = answers['social_anxiety'] || 0;
    const panicScore = answers['panic_attacks'] || 0;
    const functionalImpairment = answers['functional_impairment'] || 0;
    
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    
    // Determine risk level and conditions based on validated cutoff scores
    let riskLevel: 'low' | 'moderate' | 'high' | 'severe';
    let recommendations: string[] = [];
    let potentialConditions: string[] = [];
    
    // GAD-7 interpretation (validated cutoffs)
    if (gad7Score >= 15) {
      riskLevel = 'severe';
      potentialConditions.push('Severe Generalized Anxiety Disorder');
    } else if (gad7Score >= 10) {
      riskLevel = 'high';
      potentialConditions.push('Moderate to Severe Generalized Anxiety Disorder');
    } else if (gad7Score >= 5) {
      riskLevel = riskLevel === 'severe' ? 'severe' : 'moderate';
      potentialConditions.push('Mild Generalized Anxiety Disorder');
    }
    
    // PHQ-9 interpretation (validated cutoffs)
    if (phq9Score >= 20) {
      riskLevel = 'severe';
      potentialConditions.push('Severe Major Depressive Disorder');
    } else if (phq9Score >= 15) {
      riskLevel = riskLevel === 'severe' ? 'severe' : 'high';
      potentialConditions.push('Moderately Severe Major Depressive Disorder');
    } else if (phq9Score >= 10) {
      riskLevel = riskLevel === 'severe' || riskLevel === 'high' ? riskLevel : 'moderate';
      potentialConditions.push('Moderate Major Depressive Disorder');
    } else if (phq9Score >= 5) {
      potentialConditions.push('Mild Major Depressive Disorder');
    }
    
    // PCL-5 interpretation (trauma symptoms)
    if (pcl5Score >= 12) {
      potentialConditions.push('Possible PTSD or Trauma-Related Symptoms');
      riskLevel = riskLevel === 'severe' ? 'severe' : 'high';
    } else if (pcl5Score >= 6) {
      potentialConditions.push('Mild Trauma-Related Symptoms');
    }
    
    // Social Anxiety interpretation
    if (socialAnxietyScore >= 2) {
      potentialConditions.push('Social Anxiety Disorder');
    }
    
    // Panic Disorder interpretation
    if (panicScore >= 2) {
      potentialConditions.push('Panic Disorder');
    }
    
    // Suicidality check (PHQ-9 item 9)
    if (answers['phq9_9'] >= 1) {
      riskLevel = 'severe';
      recommendations.unshift('⚠️ IMMEDIATE ACTION REQUIRED: Contact crisis helpline or emergency services');
      potentialConditions.push('Suicidal Ideation - Requires Immediate Attention');
    }
    
    // Set default risk level if not determined by specific conditions
    if (!riskLevel) {
      if (totalScore < 10) riskLevel = 'low';
      else if (totalScore < 25) riskLevel = 'moderate';
      else if (totalScore < 40) riskLevel = 'high';
      else riskLevel = 'severe';
    }
    
    // Evidence-based recommendations
    if (riskLevel === 'low') {
      recommendations.push(
        'Continue healthy lifestyle habits (exercise, sleep, nutrition)',
        'Practice preventive mental health strategies (mindfulness, stress management)',
        'Monitor symptoms and seek support if they worsen'
      );
      if (potentialConditions.length === 0) {
        potentialConditions = ['Normal stress response', 'No significant mental health concerns identified'];
      }
    } else if (riskLevel === 'moderate') {
      recommendations.push(
        'Consider evidence-based self-help resources (CBT workbooks, mindfulness apps)',
        'Regular exercise (30 minutes, 3-5 times per week) - proven effective for anxiety/depression',
        'Consider therapy consultation if symptoms persist or worsen',
        'Practice good sleep hygiene and limit caffeine/alcohol'
      );
    } else if (riskLevel === 'high') {
      recommendations.push(
        'Strongly recommend professional therapy (CBT is first-line treatment)',
        'Consider psychiatric evaluation for medication if therapy alone is insufficient',
        'Implement comprehensive lifestyle changes (exercise, sleep, nutrition)',
        'Consider intensive outpatient programs if available',
        'Engage support system (family, friends, support groups)'
      );
    } else if (riskLevel === 'severe') {
      recommendations.push(
        'Seek immediate professional mental health treatment',
        'Consider intensive treatment options (IOP, PHP, or inpatient care)',
        'Psychiatric evaluation for medication management highly recommended',
        'Crisis safety planning with mental health professional',
        'Regular monitoring by healthcare team'
      );
    }
    
    // Functional impairment considerations
    if (functionalImpairment >= 2) {
      recommendations.push('Address functional impairment through occupational therapy or vocational rehabilitation');
    }
    
    const results: ClinicalAssessmentResult = {
      scores: {
        gad7: gad7Score,
        phq9: phq9Score,
        pcl5: pcl5Score,
        socialAnxiety: socialAnxietyScore,
        panic: panicScore,
        functional: functionalImpairment,
        total: totalScore
      },
      totalScore,
      riskLevel,
      recommendations,
      potentialConditions
    };

    onComplete(results);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Clinical Assessment</h2>
            <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentQ.question}
        </h3>
        
        <RadioGroup 
          value={answers[currentQ.id]?.toString() || ''} 
          onValueChange={(value) => handleAnswer(parseInt(value))}
          className="space-y-3"
        >
          {currentQ.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
              <Label htmlFor={option.value.toString()} className="text-gray-900 cursor-pointer flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={answers[currentQ.id] === undefined}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next'}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Clinical Assessment Disclaimer</p>
            <p>This assessment uses validated clinical screening tools (GAD-7, PHQ-9, PCL-5) for informational purposes only. It does not constitute medical diagnosis or treatment. Results should be discussed with a qualified mental health professional for proper clinical interpretation and care planning.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ClinicalAssessment;
