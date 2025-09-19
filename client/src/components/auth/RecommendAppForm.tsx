import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share, CheckCircle, Heart } from 'lucide-react';

const RecommendAppForm: React.FC = () => {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    senderName: '',
    personalMessage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/recommend-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error?.message || 'Failed to send recommendation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Recommendation Sent!</CardTitle>
          <CardDescription>
            Your recommendation has been sent to {formData.recipientEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Heart className="w-4 h-4" />
            <AlertDescription>
              Thank you for sharing Tranquil Support with someone who might benefit from mental health support.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ recipientEmail: '', senderName: '', personalMessage: '' });
            }}
            className="w-full mt-4"
          >
            Send Another Recommendation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Share className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Recommend Tranquil Support</CardTitle>
        <CardDescription className="text-center">
          Share this mental health app with someone who might benefit from anxiety support and therapeutic tools.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="recipientEmail" className="text-sm font-medium">
              Recipient's Email *
            </label>
            <Input
              id="recipientEmail"
              name="recipientEmail"
              type="email"
              placeholder="friend@example.com"
              value={formData.recipientEmail}
              onChange={handleInputChange}
              required
              data-testid="input-recipient-email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senderName" className="text-sm font-medium">
              Your Name (Optional)
            </label>
            <Input
              id="senderName"
              name="senderName"
              type="text"
              placeholder="Your name"
              value={formData.senderName}
              onChange={handleInputChange}
              data-testid="input-sender-name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personalMessage" className="text-sm font-medium">
              Personal Message (Optional)
            </label>
            <Textarea
              id="personalMessage"
              name="personalMessage"
              placeholder="Add a personal note about why you think they might find this app helpful..."
              value={formData.personalMessage}
              onChange={handleInputChange}
              rows={3}
              data-testid="textarea-personal-message"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            data-testid="button-send-recommendation"
          >
            {isLoading ? 'Sending...' : 'Send Recommendation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RecommendAppForm;