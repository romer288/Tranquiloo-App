
import React from 'react';
import { Shield, Heart, Lock } from 'lucide-react';

const WelcomeContent: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Mental Health Journey
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Join thousands of users who trust Anxiety Companion for personalized,
          AI-powered mental health support available 24/7.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-700">HIPAA-compliant and completely private</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-gray-700">Clinically-informed anxiety support</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Lock className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-gray-700">Advanced analytics and progress tracking</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Important:</strong> This app is designed to complement, not replace, 
          professional mental health care. If you're experiencing a mental health emergency, 
          please contact your local crisis helpline immediately.
        </p>
      </div>
    </div>
  );
};

export default WelcomeContent;
