
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormData } from '@/types/registration';
import { useRegistrationAuth } from '@/hooks/registration/useRegistrationAuth';
import { useRegistrationSteps } from '@/hooks/registration/useRegistrationSteps';


export const useRegistrationFlow = () => {
  const navigate = useNavigate();
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    role: 'patient'
  });

  const { isLoading, handleGoogleSignUp, handleEmailSignUp, handleEmailSignIn } = useRegistrationAuth();
  const { 
    step, 
    setStep,
    handleTherapistLinking, 
    handleAssessmentComplete, 
    handleAssessmentSkip, 
    handleComplete,
    moveToTherapistLinking
  } = useRegistrationSteps();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignUpClick = async () => {
    const result = await handleGoogleSignUp(formData.role);
    // For Google sign-up, let useRegistrationSteps handle the flow advancement
    // Don't redirect here - let Registration component handle final redirects
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignInMode) {
      console.log('Sign in submission started with email:', formData.email, 'role:', formData.role);
      const result = await handleEmailSignIn(formData.email, formData.password, formData.role);
      
      if (result.success) {
        // Redirect based on role after successful sign-in
        setTimeout(() => {
          const redirectUrl = formData.role === 'therapist' ? '/therapist-dashboard' : '/dashboard';
          console.log('Redirecting after successful sign-in to:', redirectUrl);
          navigate(redirectUrl, { replace: true });
        }, 1500); // Small delay to show success message
      }
    } else {
      console.log('Form submission started with data:', { 
        email: formData.email, 
        firstName: formData.firstName,
        agreeToTerms: formData.agreeToTerms 
      });
      const result = await handleEmailSignUp(formData);
      
      if (result.success) {
        // For sign-up, advance to the next step in registration flow
        setStep('registration-complete');
      }
    }
  };

  const handleContinueToTherapistLinking = () => {
    setStep('therapist-linking');
  };

  return {
    step,
    formData,
    isLoading,
    isSignInMode,
    setIsSignInMode,
    handleInputChange,
    handleGoogleSignUp: handleGoogleSignUpClick,
    handleSubmit,
    handleContinueToTherapistLinking,
    handleTherapistLinking,
    handleAssessmentComplete,
    handleAssessmentSkip,
    handleComplete
  };
};
