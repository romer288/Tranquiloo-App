import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/routes";
import { useToast } from "@/hooks/use-toast";

export default function Verify() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check if already verified
  useEffect(() => {
    if (!loading && user?.emailVerified) {
      const redirectPath = searchParams.get('redirect') || 
        (user.role === 'therapist' ? ROUTES.therapistDashboard : ROUTES.dashboard);
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, searchParams]);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    setResendSuccess(false);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const result = await response.json();

      if (result.success) {
        setResendSuccess(true);
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox for the new verification link.",
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to Resend",
          description: result.error?.message || "Could not send verification email. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    // Refresh user data to check if now verified
    await refreshUser();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate(ROUTES.login, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Checking verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{user?.email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Please check your email and click the verification link to access your account.
              The link expires in 24 hours.
            </AlertDescription>
          </Alert>

          {resendSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                A new verification email has been sent. Please check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleCheckVerification}
              className="w-full"
              variant="default"
              data-testid="button-check-verification"
            >
              I've Verified My Email
            </Button>

            <Button
              onClick={handleResendVerification}
              disabled={isResending || resendSuccess}
              variant="outline"
              className="w-full"
              data-testid="button-resend-verification"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full"
              data-testid="button-logout"
            >
              Sign Out
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <a href="mailto:support@tranquiloo.com" className="text-blue-600 hover:underline">
                contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}