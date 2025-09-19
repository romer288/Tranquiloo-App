import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        console.log('OAuth callback received:', { code: code?.substring(0, 10) + '...', state });
        
        if (code) {
          // Handle OAuth code from Google - use correct endpoint
          const response = await fetch('/auth/google/callback', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            await authService.setCurrentUser(userData.user);
            
            // Redirect based on user role
            if (userData.user.role === 'therapist') {
              navigate('/therapist-dashboard');
            } else {
              navigate('/dashboard');
            }
            return;
          }
        }
        
        // If callback fails, redirect to login with error
        console.error('OAuth callback failed');
        navigate('/login?error=oauth_failed');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=oauth_error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing Sign In...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}