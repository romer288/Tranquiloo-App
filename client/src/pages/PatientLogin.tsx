import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Google OAuth types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}
import { Heart, Users, Shield, Mail, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';
import SuccessMessage from '@/components/ui/success-message';
import { safeStorage } from '@/services/safeStorage';

const PatientLogin: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [oauthMessage, setOauthMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Default to patient
    // Therapist-specific fields
    licenseNumber: '',
    specialty: '',
    yearsExperience: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [signInError, setSignInError] = useState('');
  
  // Check URL params for OAuth messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('signup_success') === 'true') {
      const email = params.get('email');
      setSuccessEmail(email || '');
      setShowSuccessMessage(true);
      // Clean up URL
      window.history.replaceState({}, document.title, '/login');
    }
    
    if (params.get('error') === 'verification_required') {
      const email = params.get('email');
      setSignInError(`Please verify your email address (${email}) first. Check your inbox for the verification link.`);
      // Clean up URL
      window.history.replaceState({}, document.title, '/login');
    }
    
    if (params.get('verified') === 'true') {
      setSuccessEmail('');
      setShowSuccessMessage(true);
      // Clean up URL
      window.history.replaceState({}, document.title, '/login');
    }
  }, []);

  const handleGoogleSignIn = async (isSignUp: boolean) => {
    setIsLoading(true);
    
    // Always use server-side OAuth for better reliability
    const role = isSignUp ? formData.role : 'patient';
    const returnUrl = role === 'therapist' ? '/therapist-dashboard' : '/dashboard';
    
    console.log('Redirecting to server-side OAuth with role:', role);
    window.location.href = `/auth/google?role=${role}&returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignInError('');

    try {
      console.log('Signing in with:', formData.email);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          isSignIn: true // Explicitly tell backend this is sign-in
        })
      });

      const result = await response.json();
      console.log('Sign in response:', response.status, result);
      
      if (result.error && result.error.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify?redirect=/dashboard');
        return;
      }

      if (result.success) {
        // Check if email verification is required
        if (result.user && !result.user.emailVerified) {
          setSignInError('Please verify your email address first. Check your inbox for the verification link.');
        } else {
          // Store user data and redirect
          safeStorage.setItem('auth_user', JSON.stringify(result.user));
          window.dispatchEvent(new StorageEvent('storage', { key: 'auth_user' }));
          const redirectUrl = result.user.role === 'therapist' ? ROUTES.therapistDashboard : ROUTES.dashboard;
          navigate(redirectUrl, { replace: true });
        }
      } else {
        console.log('Sign in failed:', result.error);
        setSignInError(result.error?.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setSignInError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend authentication API
      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isSignIn: false // Explicitly tell backend this is sign-up
        })
      });

      const signInResult = await signInResponse.json();

      if (signInResult.success) {
        // Check if this is a new account that needs verification
        if (signInResult.message && signInResult.message.includes('verify')) {
          setSuccessEmail(formData.email);
          setShowSuccessMessage(true);
          setIsLoading(false);
          return;
        }
        
        const userData = {
          id: signInResult.user.id,
          email: signInResult.user.email,
          username: signInResult.user.username,
          role: signInResult.user.role,
          authMethod: 'email',
          emailVerified: signInResult.user.emailVerified
        };
        
        safeStorage.setItem('auth_user', JSON.stringify(userData));
        window.dispatchEvent(new StorageEvent('storage', { key: 'auth_user' }));
        
        // Redirect based on role
        const redirectUrl = userData.role === 'therapist' ? ROUTES.therapistDashboard : ROUTES.dashboard;
        console.log('Authentication successful, redirecting to:', redirectUrl);
        navigate(redirectUrl, { replace: true });
      } else {
        if (signInResult.error?.code === 'EMAIL_NOT_VERIFIED') {
          navigate(`${ROUTES.verify}?redirect=${encodeURIComponent(ROUTES.dashboard)}`);
        } else {
          alert(signInResult.error?.message || 'Authentication failed');
        }
      }
    } catch (error) {
      console.error('Email auth error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const result = await response.json();

      if (result.success) {
        setForgotSubmitted(true);
      } else {
        setForgotError(result.error?.message || 'Failed to send reset email');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message after account creation
  if (showSuccessMessage) {
    return (
      <SuccessMessage 
        email={successEmail} 
        onBack={() => setShowSuccessMessage(false)} 
      />
    );
  }

  // Forgot password success screen
  if (forgotSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              If an account exists with {forgotEmail}, we've sent password reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Mail className="w-4 h-4" />
                <AlertDescription>
                  Check your email and click the reset link to create a new password. 
                  The link expires in 1 hour.
                </AlertDescription>
              </Alert>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setForgotSubmitted(false);
                  setForgotEmail('');
                  setActiveView('signin');
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tranquiloo
          </h1>
          <p className="text-gray-600">
            Your mental health journey starts here
          </p>
        </div>

        <Card className="shadow-lg">
          {/* Sign In View */}
          {activeView === 'signin' && (
              <CardContent className="space-y-4 pt-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">Welcome Back</h2>
                  <p className="text-sm text-gray-600">Sign in to continue your journey</p>
                </div>

                {/* Google Sign In */}
                <div id="google-signin-container" className="w-full">
                  <Button
                    onClick={() => handleGoogleSignIn(false)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                    data-testid="button-google-signin"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                {signInError && (
                  <Alert variant="destructive">
                    <AlertDescription>{signInError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-signin-email"
                  />
                  
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="input-signin-password"
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-signin-submit"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setActiveView('signup')}
                      className="text-blue-600 hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                  <button
                    onClick={() => setActiveView('forgot')}
                    className="text-sm text-blue-600 hover:underline mt-2 block"
                  >
                    Forgot your password?
                  </button>
                </div>
              </CardContent>
          )}

          {/* Sign Up View */}
          {activeView === 'signup' && (
              <CardContent className="space-y-4 pt-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">Create Account</h2>
                  <p className="text-sm text-gray-600">Join our mental health community</p>
                </div>

                {/* Role Selection */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 text-center">I am registering as:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={formData.role === 'patient' ? 'default' : 'outline'}
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={() => setFormData({ ...formData, role: 'patient' })}
                      data-testid="button-select-patient"
                    >
                      <Heart className="w-5 h-5 mb-1" />
                      <span className="text-sm">Patient</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === 'therapist' ? 'default' : 'outline'}
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={() => setFormData({ ...formData, role: 'therapist' })}
                      data-testid="button-select-therapist"
                    >
                      <Shield className="w-5 h-5 mb-1" />
                      <span className="text-sm">Therapist</span>
                    </Button>
                  </div>
                </div>

                {/* Google Sign Up */}
                <Button
                  onClick={() => handleGoogleSignIn(true)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                  data-testid="button-google-signup"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Signing up...' : 'Continue with Google'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      data-testid="input-firstname"
                    />
                    <Input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      data-testid="input-lastname"
                    />
                  </div>

                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-signup-email"
                  />
                  
                  <Input
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    data-testid="input-signup-password"
                  />
                  
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    data-testid="input-confirm-password"
                  />

                  {formData.role === 'therapist' && (
                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>
                        You'll have immediate access to the therapist dashboard while we verify your license in the background.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-signup-submit"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setActiveView('signin')}
                      className="text-blue-600 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                  <button
                    onClick={() => setActiveView('forgot')}
                    className="text-sm text-blue-600 hover:underline mt-2 block"
                  >
                    Forgot your password?
                  </button>
                </div>
              </CardContent>
          )}

          {/* Forgot Password View */}
          {activeView === 'forgot' && (
              <CardContent className="space-y-4 pt-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">Reset Password</h2>
                  <p className="text-sm text-gray-600">We'll send you instructions to reset your password</p>
                </div>

                {forgotError && (
                  <Alert variant="destructive">
                    <AlertDescription>{forgotError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      data-testid="input-forgot-email"
                    />
                    <p className="text-xs text-gray-500">
                      Enter the email address associated with your account
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-send-reset"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                      onClick={() => setActiveView('signin')}
                      className="text-blue-600 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </CardContent>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link to="/therapist-login" className="text-sm text-gray-600 hover:text-gray-900 underline">
            Are you a therapist? Click here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;