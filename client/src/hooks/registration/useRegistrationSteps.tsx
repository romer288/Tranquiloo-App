import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { RegistrationStep, TherapistInfo } from '@/types/registration';
import { AuthService } from '@/services/authService';

import { goalsService } from '@/services/goalsService';

export const useRegistrationSteps = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<RegistrationStep>('registration');
  const initialCheckDone = useRef(false);

  // Check URL params for step
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam && ['registration-complete', 'therapist-linking', 'assessment', 'complete'].includes(stepParam)) {
      setStep(stepParam as RegistrationStep);
    }
  }, []);

  // Ensure new OAuth users have profiles and roles
  const ensureProfileRow = async (user: any) => {
    try {
      console.log('🔍 DETAILED: Checking/creating profile for user:', user.id);
      
      // Get role from multiple sources with detailed logging
      const urlParams = new URLSearchParams(window.location.search);
      const urlRole = urlParams.get('role') as 'patient' | 'therapist';
      console.log('🔍 URL ROLE CHECK:', urlRole, 'from URL:', window.location.href);
      
      const localStorageRole = localStorage.getItem('pending_user_role') as 'patient' | 'therapist';
      const sessionStorageRole = sessionStorage.getItem('pending_user_role') as 'patient' | 'therapist';
      
      // Check OAuth role data with timestamp
      let oauthRole: 'patient' | 'therapist' | null = null;
      try {
        const oauthData = localStorage.getItem('oauth_role_data') || sessionStorage.getItem('oauth_role_data');
        if (oauthData) {
          const parsed = JSON.parse(oauthData);
          // Only use if it's less than 5 minutes old
          if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            oauthRole = parsed.role;
          }
        }
      } catch (e) {
        console.log('Error parsing OAuth role data');
      }
      
      // Parse OAuth state for role
      let stateRole: 'patient' | 'therapist' | null = null;
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const state = hashParams.get('state');
        if (state) {
          const stateData = JSON.parse(state);
          stateRole = stateData.role;
        }
      } catch (e) {
        console.log('No OAuth state found or invalid JSON');
      }
      
      // CRITICAL: URL role parameter takes ABSOLUTE priority for OAuth redirects
      const pendingRole = urlRole || oauthRole || localStorageRole || sessionStorageRole || stateRole || 'patient';
      
      console.log('📱 DETAILED: Role sources:', {
        urlParam: urlRole,
        oauthRole: oauthRole,
        localStorage: localStorageRole,
        sessionStorage: sessionStorageRole,
        stateRole: stateRole,
        finalRole: pendingRole,
        currentUrl: window.location.href,
        PRIORITY_CHECK: `URL param '${urlRole}' should override everything else`
      });
      
      // For migration, profile creation is handled by AuthService
      console.log('Profile check/creation handled by AuthService during sign-in');
      return true; // Profile creation is handled automatically
    } catch (error) {
      console.error('💥 DETAILED: Error in ensureProfileRow:', error);
      // Don't clean up localStorage on error - keep role for retry
      return false;
    }
  };

  // Auto-advance to registration-complete when user becomes authenticated during registration
  useEffect(() => {
    console.log('🎯 Setting up auth listener for step:', step);
    
    // For migration, check authentication state differently
    const checkAuthState = async () => {
      const user = await AuthService.getCurrentUser();
      if (user && !initialCheckDone.current) {
        console.log('User authenticated:', user.id);
        console.log('Current step:', step, 'Initial check done:', initialCheckDone.current);
        
        // For migration, automatically advance to registration-complete
        if (step === 'form') {
          setStep('registration-complete');
        }
      }
    };
    
    checkAuthState();
  }, [step]);

  const handleTherapistLinking = (hasTherapist: boolean, therapistInfo?: TherapistInfo) => {
    console.log('Therapist linking completed:', { hasTherapist, therapistInfo });
    
    if (hasTherapist && therapistInfo) {
      toast({
        title: "Therapist Connected",
        description: `Successfully connected with ${therapistInfo.name}. Now let's complete your assessment.`,
      });
    }
    
    console.log('Proceeding to assessment');
    setStep('assessment');
  };

  // Removed automatic goal creation - goals should only be created by user choice

  const handleAssessmentComplete = async (results: any) => {
    console.log('Clinical assessment results:', results);
    
    toast({
      title: "Assessment Complete",
      description: "Your clinical assessment has been completed. Welcome to Anxiety Companion!",
    });
    setStep('complete');
  };

  const handleAssessmentSkip = async () => {
    console.log('Assessment skipped');
    
    toast({
      title: "Assessment Skipped",
      description: "You can take the assessment later from your dashboard. Welcome to Anxiety Companion!",
    });
    setStep('complete');
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const moveToTherapistLinking = () => {
    setStep('therapist-linking');
  };

  return {
    step,
    setStep,
    handleTherapistLinking,
    handleAssessmentComplete,
    handleAssessmentSkip,
    handleComplete,
    moveToTherapistLinking
  };
};