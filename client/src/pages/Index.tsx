
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import WelcomeHero from '@/components/WelcomeHero';
import BreathingExercise from '@/components/BreathingExercise';
import MoodTracker from '@/components/MoodTracker';
import CopingStrategies from '@/components/CopingStrategies';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Check localStorage for authenticated user
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('User is authenticated, checking for role redirection...');
          console.log('User ID:', user.id);
          
          // Get the user's role from the API
          console.log('Fetching profile for user ID:', user.id);
          const response = await fetch(`/api/profiles/${user.id}`);
          
          if (response.ok) {
            const profile = await response.json();
            console.log('Profile fetch result:', profile);
            
            const role = profile?.role || 'patient'; // Default to patient if no role found
            console.log('User role from profiles table:', role);
            console.log('Role comparison - is therapist?', role === 'therapist');
            
            if (role === 'therapist') {
              console.log('Redirecting therapist to therapist portal');
              navigate('/therapist-dashboard');
              return;
            } else {
              console.log('Redirecting patient to dashboard');
              navigate('/dashboard');
              return;
            }
          } else {
            console.error('Error fetching user profile');
            // If there's an error fetching profile, default to patient dashboard
            console.log('Defaulting to patient dashboard due to profile fetch error');
            navigate('/dashboard');
            return;
          }
        } catch (error) {
          console.error('Unexpected error checking user role:', error);
          // Default to patient dashboard on any error
          console.log('Defaulting to patient dashboard due to unexpected error');
          navigate('/dashboard');
        }
      }
    };
    
    checkAuthAndRedirect();
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <WelcomeHero />
      
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="grid md:grid-cols-2 gap-8">
          <BreathingExercise />
          <MoodTracker />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <CopingStrategies />
        </div>
        
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-lg mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">Get Started</h3>
              <p className="text-blue-800 text-sm mb-3">
                Join thousands of users who have found peace and support through our platform
              </p>
              <a 
                href="/registration" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors mr-3"
              >
                Sign Up
              </a>
              <a 
                href="/registration" 
                className="inline-block bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-6 py-3 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-lg mx-auto mt-4">
              <h3 className="font-semibold text-blue-900 mb-2">For Mental Health Professionals</h3>
              <p className="text-blue-800 text-sm mb-3">
                Access real-time patient analytics and receive automated weekly progress reports
              </p>
              <a 
                href="/therapist-info" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Learn About Therapist Portal
              </a>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Remember: This app is not a substitute for professional mental health care. 
            If you're experiencing severe anxiety or depression, please reach out to a mental health professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
