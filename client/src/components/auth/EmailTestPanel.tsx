import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, Settings } from 'lucide-react';

const EmailTestPanel: React.FC = () => {
  const handleViewEmails = async () => {
    try {
      const response = await fetch('/api/debug/emails');
      const emails = await response.json();
      console.log('Queued emails:', emails);
      alert(`Found ${emails.length} emails in queue. Check console for details.`);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    }
  };

  const handleTestVerification = () => {
    // For testing - this would normally come from email
    const testToken = prompt('Enter verification token from console logs:');
    if (testToken) {
      window.open(`/verify-email?token=${testToken}`, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Email System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Mail className="w-4 h-4" />
          <AlertDescription>
            <strong>For Testing:</strong> SendGrid emails are logged to console. 
            Check browser console or server logs for verification links.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Button onClick={handleViewEmails} variant="outline" className="w-full">
            View Queued Emails
          </Button>
          
          <Button onClick={handleTestVerification} variant="outline" className="w-full">
            Test Email Verification
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Get SendGrid API Key
            </a>
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <strong>SendGrid Setup:</strong><br />
          1. Go to SendGrid → Settings → API Keys<br />
          2. Create "Restricted Access" key<br />
          3. Enable only "Mail Send" permission<br />
          4. Key must start with "SG."<br />
          5. Add to Replit Secrets as SENDGRID_API_KEY
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestPanel;