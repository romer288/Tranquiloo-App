
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ onComplete }) => {
  return (
    <Card className="max-w-2xl mx-auto p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to Anxiety Companion!
      </h2>
      <p className="text-gray-600 mb-6">
        Your account has been set up successfully and your clinical assessment is complete. 
        You can now start your mental health journey with personalized AI support.
      </p>
      <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
        Go to Dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
};

export default CompletionStep;
