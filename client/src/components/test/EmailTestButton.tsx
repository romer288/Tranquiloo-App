import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

const EmailTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  const testEmailDelivery = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Create a test account to trigger email
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'test123',
          role: 'patient',
          firstName: 'Email',
          lastName: 'Test'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: `Account created! Check email: ${data.user.email}`
        });
      } else {
        setResult({
          success: false,
          message: data.error?.message || 'Test failed'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error during test'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Delivery Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testEmailDelivery} 
          disabled={testing}
          className="w-full"
          data-testid="button-test-email"
        >
          {testing ? 'Testing...' : 'Test Email Delivery'}
        </Button>

        {result && (
          <Alert className={result.success ? 'border-green-200' : 'border-red-200'}>
            {result.success ? 
              <CheckCircle className="w-4 h-4 text-green-600" /> : 
              <XCircle className="w-4 h-4 text-red-600" />
            }
            <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Current Status:</strong><br />
          - If SendGrid configured: Real email sent<br />
          - If not configured: Check console logs<br />
          - Email verification is enforced either way
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestButton;