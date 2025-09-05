import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, Phone, MapPin, User, MessageCircle, FileText, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ContactTherapist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasTherapist, setHasTherapist] = useState<boolean | null>(null);
  const [therapistCode, setTherapistCode] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleDownloadAnxietyData = async () => {
    try {
      // Download both History and Conversation Summary as requested
      const { downloadPDFReport } = await import('@/services/analyticsExportService');
      const { downloadSummaryReport } = await import('@/services/summaryReportService');
      
      // For users without therapist, download their data
      toast({
        title: "Download Started",
        description: "Downloading your anxiety data and conversation summary...",
      });
      
      // Simulate data download - in real app this would fetch user's data
      downloadPDFReport([]); // Empty array - would be user's actual analyses
      downloadSummaryReport([], [], []); // Empty arrays - would be user's actual data
      
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download anxiety data",
        variant: "destructive",
      });
    }
  };

  const handleConnectToTherapist = async () => {
    if (!email) {
      toast({
        title: "Missing Information",
        description: "Please provide your therapist's email address",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Get current user from localStorage to include their email and patient code
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Send connection request to therapist
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/therapist-connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || `user_${Date.now()}`,
          therapistName: 'Dr Becker', // Default name, can be extracted from email
          contactValue: email,
          shareReport: 'yes',
          notes: message || '',
          patientEmail: currentUser.email || 'Patient email not available',
          patientCode: currentUser.patientCode || 'Code not available'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send connection request');
      }
      
      toast({
        title: "Connection Request Sent",
        description: "Your therapist will receive a notification to approve the connection",
      });
      
      setTherapistCode('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect with therapist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="contact-therapist-container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-page-title">
            Contact Therapist
          </h1>
          <p className="text-gray-600" data-testid="text-page-description">
            Connect with your therapist or download your anxiety data for professional consultation
          </p>
        </div>

        {/* Therapist Status Question */}
        {hasTherapist === null && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Do you currently have a therapist?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setHasTherapist(true)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-has-therapist"
                >
                  Yes, I have a therapist
                </Button>
                <Button 
                  onClick={() => setHasTherapist(false)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-no-therapist"
                >
                  No, I don't have a therapist
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* For users WITH a therapist */}
        {hasTherapist === true && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Connect with Your Therapist
              </CardTitle>
              <p className="text-gray-600">
                Enter your therapist's email to send them a connection request
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="therapist-email">Therapist Email</Label>
                <Input
                  id="therapist-email"
                  type="email"
                  placeholder="therapist@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-therapist-email"
                />
              </div>
              <div>
                <Label htmlFor="connection-message">Message (Optional)</Label>
                <Textarea
                  id="connection-message"
                  placeholder="Let your therapist know about your current concerns..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  data-testid="textarea-message"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handleConnectToTherapist}
                  disabled={isConnecting}
                  className="flex-1"
                  data-testid="button-connect-therapist"
                >
                  {isConnecting ? 'Connecting...' : 'Send Connection Request'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setHasTherapist(null)}
                  data-testid="button-back"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* For users WITHOUT a therapist */}
        {hasTherapist === false && (
          <div className="space-y-6">
            {/* Self-guided mode banner */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">You're in self-guided mode</h3>
                    <p className="text-blue-700 text-sm">
                      Continue using the app for anxiety management. Consider connecting with a therapist for professional support.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download anxiety data option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Download Your Anxiety Data
                </CardTitle>
                <p className="text-gray-600">
                  Get your complete anxiety tracking data and conversation summaries to share with a mental health professional
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">Your data package includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete anxiety tracking history and trends</li>
                    <li>• Conversation summaries with AI companion</li>
                    <li>• Trigger analysis and patterns</li>
                    <li>• Goal progress and intervention outcomes</li>
                    <li>• Clinical assessment results</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleDownloadAnxietyData}
                  className="w-full"
                  data-testid="button-download-data"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download My Anxiety Data
                </Button>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setHasTherapist(null)}
                    className="w-full"
                    data-testid="button-back-choice"
                  >
                    Back to Options
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Find a therapist section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Ready to Find a Therapist?
                </CardTitle>
                <p className="text-gray-600">
                  Professional therapy can significantly improve your anxiety management journey
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Benefits of Professional Therapy:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Personalized treatment plans based on your specific needs</li>
                      <li>• Evidence-based therapeutic approaches (CBT, DBT, etc.)</li>
                      <li>• Professional crisis support and intervention</li>
                      <li>• Medication management when appropriate</li>
                      <li>• Long-term recovery and coping strategies</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => window.open('/find-therapist', '_self')}
                    className="w-full"
                    data-testid="button-find-therapist"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Therapists Near Me
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Resources */}
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergency Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-semibold">National Suicide Prevention Lifeline</p>
                  <p className="text-sm text-gray-600">24/7 crisis support</p>
                </div>
                <Badge variant="secondary">988</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-semibold">Crisis Text Line</p>
                  <p className="text-sm text-gray-600">Text support available 24/7</p>
                </div>
                <Badge variant="secondary">Text HOME to 741741</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-semibold">SAMHSA National Helpline</p>
                  <p className="text-sm text-gray-600">Treatment referral and information</p>
                </div>
                <Badge variant="secondary">1-800-662-4357</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactTherapist;