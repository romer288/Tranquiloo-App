
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Heart } from 'lucide-react';
import { useRegistrationFlow } from '@/hooks/useRegistrationFlow';
import { IframeWarning } from '@/components/IframeWarning';
import RegistrationHeader from '@/components/registration/RegistrationHeader';
import WelcomeContent from '@/components/registration/WelcomeContent';
import RegistrationForm from '@/components/registration/RegistrationForm';
import CompletionStep from '@/components/registration/CompletionStep';
import TherapistLinking from '@/components/TherapistLinking';
import ClinicalAssessment from '@/components/ClinicalAssessment';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';


const Registration = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const {
    step,
    formData,
    isLoading,
    isSignInMode,
    setIsSignInMode,
    handleInputChange,
    handleGoogleSignUp,
    handleSubmit,
    handleContinueToTherapistLinking,
    handleTherapistLinking,
    handleAssessmentComplete,
    handleAssessmentSkip,
    handleComplete
  } = useRegistrationFlow();

  console.log('Registration component - User:', user, 'Loading:', loading, 'Current step:', step);

  // Handle OAuth redirects and role-based redirection for authenticated users
  useEffect(() => {
    if (!loading && user) {
      console.log('User is authenticated in Registration, checking for role redirection...');
      console.log('User:', user);
      console.log('Current step:', step);
      
      // Check profile for actual role and redirect existing users immediately
      const checkUserRole = async () => {
        try {
          const response = await fetch(`/api/profiles/${user.id}`);
          
          if (response.ok) {
            const profile = await response.json();
            const role = profile?.role;
            const profileCreatedAt = new Date(profile?.createdAt || Date.now());
            const userCreatedAt = profileCreatedAt; // Use the actual profile creation date
            
            console.log('🔍 CRITICAL: Profile role from database:', role, 'Current step:', step);
            console.log('🕒 Profile created:', profileCreatedAt);
            
            // For existing users (user created more than 1 minute ago), redirect immediately
            const userAge = Date.now() - userCreatedAt.getTime();
            const isExistingUser = userAge > 60 * 1000; // 1 minute
            
            console.log('🕒 User age (ms):', userAge, 'Is existing user:', isExistingUser);
            
            if (isExistingUser && role) {
              console.log('🔄 EXISTING USER LOGIN DETECTED - Redirecting based on role:', role);
              if (role === 'therapist') {
                console.log('🏥 Existing therapist login - redirecting to therapist dashboard');
                navigate(ROUTES.therapistDashboard, { replace: true });
                return;
              } else {
                // Default all other cases (including 'patient') to dashboard
                console.log('👤 Existing user login - redirecting to dashboard (role:', role, ')');
                navigate(ROUTES.dashboard, { replace: true });
                return;
              }
            }
            
            // For new users going through registration flow
            // For therapists, redirect IMMEDIATELY after registration-complete step
            if (role === 'therapist') {
              if (step === 'registration-complete') {
                console.log('🏥 NEW THERAPIST: Redirecting to therapist portal immediately');
                navigate(ROUTES.therapistPortal, { replace: true });
                return;
              }
            }
            
            // For patients, auto-advance from registration-complete to therapist-linking
            if (role === 'patient' && step === 'registration-complete') {
              console.log('👤 NEW PATIENT: Auto-advancing to therapist linking after 1 second');
              setTimeout(() => {
                handleContinueToTherapistLinking();
              }, 1000);
              return;
            }
            
            // Only redirect patients on COMPLETE step, not during registration flow
            if (step === 'complete') {
              if (role === 'patient') {
                console.log('Patient completed registration, redirecting to dashboard');
                navigate('/dashboard');
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error checking user role:', error);
        }
      };
      
      checkUserRole();
    }
  }, [user, loading, navigate, step]);

  // Don't render if still loading auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-4 h-4 text-blue-600 animate-pulse" />
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (step === 'registration-complete') {
    // For therapists, this component will auto-redirect via useEffect
    // For patients, show the continue setup UI
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <RegistrationHeader />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Anxiety Companion!</h2>
              <p className="text-lg text-gray-600 mb-8">Your account has been successfully created. Setting up your experience...</p>
            </div>
            {/* Show loading state while checking role for redirect */}
            <div className="animate-pulse">
              <div className="bg-gray-200 h-12 w-48 rounded-lg mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'therapist-linking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <RegistrationHeader />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <TherapistLinking onComplete={handleTherapistLinking} />
        </div>
      </div>
    );
  }

  if (step === 'assessment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <RegistrationHeader />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinical Assessment</h2>
              <p className="text-gray-600">This assessment helps us understand your mental health better, but it's optional.</p>
            </div>
            <ClinicalAssessment onComplete={handleAssessmentComplete} />
            <div className="text-center">
              <button
                onClick={handleAssessmentSkip}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                Skip assessment for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <RegistrationHeader />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <CompletionStep onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <RegistrationHeader />

      <div className="max-w-6xl mx-auto px-8 py-12">
        <IframeWarning />
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <WelcomeContent />
          <RegistrationForm
            formData={formData}
            isLoading={isLoading}
            isSignInMode={isSignInMode}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onGoogleSignUp={handleGoogleSignUp}
            onToggleMode={() => setIsSignInMode(!isSignInMode)}
          />
        </div>
      </div>
    </div>
  );
};

export default Registration;
