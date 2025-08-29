import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Eye, Calendar, ArrowRight, Shield, Clock } from 'lucide-react';

const TherapistInfo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Therapist Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time access to patient progress with automated weekly reports
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Live Patient Dashboard</h3>
                <Badge variant="secondary" className="mt-1">Real-time</Badge>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              View the exact same analytics and treatment outcomes that your patients see in their app. 
              Data updates in real-time as patients interact with the anxiety companion.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Anxiety level trends and triggers</li>
              <li>• Treatment effectiveness metrics</li>
              <li>• Crisis alerts and high-anxiety sessions</li>
              <li>• Coping strategy usage patterns</li>
            </ul>
          </Card>

          <Card className="p-8 border-2 border-green-100 hover:border-green-200 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Automated Weekly Reports</h3>
                <Badge variant="secondary" className="mt-1">Email delivery</Badge>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Receive comprehensive weekly progress summaries directly in your inbox. 
              No manual work required - reports are generated and sent automatically.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Weekly anxiety averages and trends</li>
              <li>• Session frequency and engagement</li>
              <li>• Common triggers and patterns</li>
              <li>• Crisis alerts and recommendations</li>
            </ul>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Patient Connects</h4>
              <p className="text-sm text-gray-600">
                Patient adds your email in their Tranquiloo app under therapist connection
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Access</h4>
              <p className="text-sm text-gray-600">
                Use the portal below with your email to see all connected patients immediately
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Weekly Reports</h4>
              <p className="text-sm text-gray-600">
                Receive automated email summaries every week with key insights and alerts
              </p>
            </div>
          </div>
        </Card>

        {/* Security & Compliance */}
        <Card className="p-6 mb-8 border-green-200 bg-green-50">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">HIPAA Compliant & Secure</h3>
          </div>
          <p className="text-green-800 text-sm">
            All patient data is encrypted and transmitted securely. Access is restricted to therapists 
            explicitly connected by patients, ensuring full privacy compliance and data protection.
          </p>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 text-center bg-white border-2 border-blue-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Access Your Patient Dashboard
          </h3>
          <p className="text-gray-600 mb-6">
            Enter your email address to view connected patients and their real-time progress data.
          </p>
          
          <Button 
            onClick={() => window.location.href = '/therapist-portal'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Open Therapist Portal
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Available 24/7</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>HIPAA Secure</span>
            </div>
          </div>
        </Card>

        {/* Demo Notice */}
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800 text-sm">
              <strong>Demo Note:</strong> For testing purposes, you can use any email address. 
              In production, only therapists with connected patients will have access to data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistInfo;