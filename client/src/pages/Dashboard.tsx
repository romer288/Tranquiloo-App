
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Shield, Users, Zap, BarChart3, Bell, UserRound, FilePen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes';

const Dashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleNotifications = () => {
    navigate(ROUTES.notifications);
  };

  const handleSettings = () => {
    navigate(ROUTES.settings);
  };

  const handleProfile = () => {
    // Navigate to user profile/settings
    navigate(ROUTES.settings);
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSettings}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Settings</span>
              <FilePen className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNotifications}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Notifications</span>
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={handleProfile}
              className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
            >
              <span className="sr-only">Profile</span>
              <UserRound className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Anxiety Guardian</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Your AI-powered anxiety support companion. Get personalized guidance,
            track your progress, and find peace of mind whenever you need it.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
              <Link to={ROUTES.chat}>
                <Zap className="w-4 h-4 mr-2" />
                Start Chatting
              </Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-3">
              <Link to={ROUTES.assessment}>
                Take Assessment
              </Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-3">
              <Link to={ROUTES.treatmentResources}>
                Track Outcomes/Treatment
              </Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-3">
              <Link to={ROUTES.analytics}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center bg-blue-50 border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe & Private</h3>
            <p className="text-gray-600 text-sm">
              Your conversations are completely private and secure
            </p>
          </Card>

          <Card className="p-6 text-center bg-green-50 border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">
              Always available when you need someone to talk to
            </p>
          </Card>

          <Card className="p-6 text-center bg-purple-50 border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Care</h3>
            <p className="text-gray-600 text-sm">
              Tailored support based on your unique needs
            </p>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>© 2025 Anxiety Companion. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-gray-700">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700">Terms of Service</a>
            <a href="#" className="hover:text-gray-700">Contact Us</a>
          </div>
          <p className="max-w-3xl mx-auto leading-relaxed">
            This app is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any questions you may have 
            regarding a medical condition.
          </p>
          <div className="flex justify-between items-center pt-4">
            <span>Anxiety Companion</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
