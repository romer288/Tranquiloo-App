import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SuccessMessageProps {
  email: string;
  onBack?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ email, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">Account Created Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <Mail className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Check your email inbox</strong><br />
              We've sent a verification link to:<br />
              <span className="font-mono text-sm bg-white px-2 py-1 rounded">{email}</span>
            </AlertDescription>
          </Alert>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Check your email inbox (and spam folder)</li>
              <li>2. Click the verification link in the email</li>
              <li>3. Return here to sign in</li>
            </ol>
          </div>
          
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> You cannot access the app until you verify your email address.
            </AlertDescription>
          </Alert>
          
          {onBack && (
            <Button onClick={onBack} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          )}
          
          <div className="text-center">
            <Link href="/login">
              <Button className="w-full">
                Go to Sign In Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessMessage;