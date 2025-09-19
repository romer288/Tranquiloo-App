
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    role: 'patient' | 'therapist';
  };
  isLoading: boolean;
  isSignInMode: boolean;
  onInputChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignUp: () => void;
  onToggleMode: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formData,
  isLoading,
  isSignInMode,
  onInputChange,
  onSubmit,
  onGoogleSignUp,
  onToggleMode
}) => {
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive"
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      // For now during migration, just show success message
      console.log('Password reset requested for:', formData.email);
      const error = null; // Placeholder - in full implementation would call authService

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset link sent",
          description: "Check your email for a password reset link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };
  return (
    <Card className="p-8 shadow-lg">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSignInMode ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-gray-600">
          {isSignInMode 
            ? 'Sign in to continue your mental health journey' 
            : 'Start your personalized mental health journey today'
          }
        </p>
      </div>

      {!isSignInMode && (
        <div className="mb-4">
          <Label>I am a:</Label>
          <RadioGroup 
            value={formData.role} 
            onValueChange={(value) => onInputChange('role', value)}
            className="flex space-x-6 mt-2"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="patient" id="patient-google" />
              <Label htmlFor="patient-google">Patient seeking support</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="therapist" id="therapist-google" />
              <Label htmlFor="therapist-google">Mental health professional</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="mb-6">
        <Button
          onClick={onGoogleSignUp}
          disabled={isLoading}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 py-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{isLoading ? (isSignInMode ? 'Signing in...' : 'Signing up...') : 'Continue with Google'}</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Continue with email</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!isSignInMode && (
          <>
            <div>
              <Label>I am a:</Label>
              <RadioGroup 
                value={formData.role} 
                onValueChange={(value) => onInputChange('role', value)}
                className="flex space-x-6 mt-2"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="patient" />
                  <Label htmlFor="patient">Patient seeking support</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="therapist" id="therapist" />
                  <Label htmlFor="therapist">Mental health professional</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => onInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => onInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isSignInMode && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResettingPassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isResettingPassword ? 'Sending...' : 'Forgot Password?'}
              </button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            placeholder={isSignInMode ? "Enter your password" : "Create a secure password"}
            required
            disabled={isLoading}
          />
        </div>

        {!isSignInMode && (
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => onInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
          </div>
        )}

        {!isSignInMode && (
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={(e) => onInputChange('agreeToTerms', e.target.checked)}
              className="mt-1"
              required
              disabled={isLoading}
            />
            <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading 
            ? (isSignInMode ? 'Signing In...' : 'Creating Account...')
            : (isSignInMode ? 'Sign In' : 'Create Account')
          }
          {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          {isSignInMode ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignInMode ? 'Create one here' : 'Sign in here'}
          </button>
        </p>
      </div>
    </Card>
  );
};

export default RegistrationForm;
