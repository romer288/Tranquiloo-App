import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { FormData } from '@/types/registration';
import { validateRegistrationForm } from '@/utils/registrationValidation';
import { AuthService } from '@/services/authService';
import { GoogleAuthService } from '@/services/googleAuth';
import { safeStorage } from '@/services/safeStorage';

export const useRegistrationAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignUp = async (role: 'patient' | 'therapist'): Promise<{ success: boolean }> => {
    console.log('Starting Google OAuth for role:', role);
    setIsLoading(true);
    
    try {
      // Store role for after OAuth completes
      localStorage.setItem('pending_user_role', role);
      
      // Check if we're on iPhone/Safari - redirect to server-side OAuth with role
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isIOS || isSafari) {
        console.log('iPhone/Safari detected, redirecting to server-side OAuth with role:', role);
        // Redirect to server-side OAuth with role parameter
        const params = new URLSearchParams({
          role: role,
          returnUrl: role === 'therapist' ? '/therapist-dashboard' : '/dashboard'
        });
        window.location.href = `/auth/google?${params.toString()}`;
        return { success: false }; // This won't actually be returned due to redirect
      }
      
      // For other browsers, attempt client-side OAuth
      const result = await GoogleAuthService.signIn();
      
      if (result.success && result.user) {
        // Store user data  
        safeStorage.setItem('auth_user', JSON.stringify(result.user));
        
        // DO NOT create duplicate profile - server-side OAuth already handles this
        
        toast({
          title: "Success!",
          description: `Signed in with Gmail as ${role}`,
        });
        
        setIsLoading(false);
        return { success: true };
      } else {
        toast({
          title: "Sign-in cancelled", 
          description: result.error || "Google sign-in was cancelled",
          variant: "destructive"
        });
        
        setIsLoading(false);
        return { success: false };
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false };
    }
  };

  const handleEmailSignUp = async (formData: FormData): Promise<{ success: boolean; needsVerification?: boolean }> => {
    const validation = validateRegistrationForm(formData);
    
    if (!validation.isValid && validation.error) {
      toast({
        title: validation.error.title,
        description: validation.error.description,
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      setIsLoading(true);
      console.log('Attempting email signup...');
      
      const result = await AuthService.signInWithEmail(formData.email, formData.password);
      
      // Check if email verification is needed
      if (result.needsVerification) {
        toast({
          title: "Check Your Email",
          description: `We sent a verification link to ${formData.email}. Please verify your email before signing in.`,
        });
        return { success: false, needsVerification: true };
      }
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome! Your account has been created.",
        });
        return { success: true, user: result.user };
      } else {
        toast({
          title: "Registration Failed", 
          description: result.error?.message || "Please try again.",
          variant: "destructive"
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Unexpected error during email registration:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (email: string, password: string, role: 'patient' | 'therapist' = 'patient'): Promise<{ success: boolean; needsVerification?: boolean }> => {
    try {
      setIsLoading(true);
      console.log('Attempting email signin...', { email, role });
      
      const result = await AuthService.signInWithEmail(email, password);
      console.log('Email signin result:', result);

      // Check if email verification is needed
      if (result.needsVerification) {
        toast({
          title: "Email Verification Required",
          description: "Please check your email and click the verification link before signing in.",
          variant: "destructive"
        });
        setIsLoading(false);
        return { success: false, needsVerification: true };
      }

      if (result.success && result.user) {
        console.log('🎉 AUTHENTICATION SUCCESS! User data received:', result.user);
        
        // Store user data with role
        const userData = { ...result.user, role };
        safeStorage.setItem('auth_user', JSON.stringify(userData));
        safeStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Stored user data to localStorage:', userData);
        
        // Verify storage worked
        const verification = safeStorage.getItem('auth_user');
        console.log('🔍 Storage verification:', verification);
        
        toast({
          title: "Success!",
          description: `Signed in successfully as ${role}`,
        });
        
        setIsLoading(false);
        
        // Immediately redirect to force full page reload and auth context refresh
        console.log('🔄 Redirecting to dashboard...');
        window.location.href = role === 'patient' ? '/dashboard' : '/therapist-dashboard';
        
        return { success: true };
      } else {
        console.error('Email signin failed:', result.error);
        
        // Handle different error cases
        const error = result.error;
        if (error && error.code === 'EMAIL_NOT_VERIFIED') {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and click the verification link to activate your account.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sign In Failed",
            description: error?.message || "Please check your credentials and try again.",
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return { success: false, needsVerification: error?.code === 'EMAIL_NOT_VERIFIED' };
      }
    } catch (error) {
      console.error('Unexpected error during email signin:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false };
    }
  };

  return {
    isLoading,
    handleGoogleSignUp,
    handleEmailSignUp,
    handleEmailSignIn
  };
};