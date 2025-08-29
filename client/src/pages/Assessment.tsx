import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ClinicalAssessment from '@/components/ClinicalAssessment';

const Assessment = () => {
  const navigate = useNavigate();

  const handleAssessmentComplete = () => {
    navigate('/dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Clinical Assessment</h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete this assessment to help us understand your mental health better
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        <ClinicalAssessment onComplete={handleAssessmentComplete} />
      </div>
    </div>
  );
};

export default Assessment;