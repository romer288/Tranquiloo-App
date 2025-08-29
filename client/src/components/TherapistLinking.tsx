
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, User, CheckCircle } from 'lucide-react';
import { TherapistInfo } from '@/types/registration';
import { AuthService } from '@/services/authService';


interface TherapistLinkingProps {
  onComplete: (hasTherapist: boolean, therapistInfo?: TherapistInfo) => void;
}

const TherapistLinking: React.FC<TherapistLinkingProps> = ({ onComplete }) => {
  const [hasTherapist, setHasTherapist] = useState<string>('');
  const [therapistInfo, setTherapistInfo] = useState<TherapistInfo>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    contactMethod: 'email'
  });
  const [step, setStep] = useState<'question' | 'details' | 'confirmation'>('question');
  const [shareReport, setShareReport] = useState<string>('');
  const { toast } = useToast();

  const handleTherapistResponse = (value: string) => {
    setHasTherapist(value);
    if (value === 'yes') {
      setStep('details');
    } else {
      onComplete(false);
    }
  };

  const handleSubmitTherapistInfo = () => {
    if (!therapistInfo.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your therapist's name.",
        variant: "destructive"
      });
      return;
    }

    if (!therapistInfo.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your therapist's email address.",
        variant: "destructive"
      });
      return;
    }

    if (!shareReport) {
      toast({
        title: "Report Sharing Required",
        description: "Please select whether you want to share your Current History Report.",
        variant: "destructive"
      });
      return;
    }

    setStep('confirmation');
  };

  const handleConfirm = async () => {
    try {
      const contactValue = therapistInfo.contactMethod === 'email' ? therapistInfo.email : therapistInfo.phone;
      
      // Get current user email (in production this would come from auth context)
      const currentUserEmail = localStorage.getItem('userEmail') || 'arth.rombus@gmail.com'; // Fallback for testing
      
      // Send connection request to our backend API with patient email
      const response = await fetch('/api/therapist-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistName: therapistInfo.name,
          contactValue: contactValue,
          shareReport: shareReport,
          notes: therapistInfo.notes,
          patientEmail: currentUserEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Connection Request Sent",
          description: `A connection request has been sent to ${therapistInfo.name}. They will be able to receive your progress reports.`,
        });
        onComplete(true, therapistInfo);
      } else {
        throw new Error(result.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (step === 'question') {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Do you currently have a therapist?
          </h2>
          <p className="text-gray-600">
            If you have a therapist, we can connect your account so they can track your progress
            and provide better support.
          </p>
        </div>

        <RadioGroup value={hasTherapist} onValueChange={handleTherapistResponse} className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes" className="text-gray-900 cursor-pointer font-medium">
              Yes, I have a therapist I'd like to connect
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no" className="text-gray-900 cursor-pointer font-medium">
              No, I don't have a therapist
            </Label>
          </div>
        </RadioGroup>
      </Card>
    );
  }

  if (step === 'details') {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Your Therapist
          </h2>
          <p className="text-gray-600">
            Please provide your therapist's information so we can send them an invitation
            to access your progress data.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="therapist-name">Therapist's Name *</Label>
            <Input
              id="therapist-name"
              value={therapistInfo.name}
              onChange={(e) => setTherapistInfo({ ...therapistInfo, name: e.target.value })}
              placeholder="Dr. Sarah Johnson"
            />
          </div>

          <div>
            <Label>Preferred Contact Method *</Label>
            <RadioGroup 
              value={therapistInfo.contactMethod} 
              onValueChange={(value: 'email' | 'phone') => 
                setTherapistInfo({ ...therapistInfo, contactMethod: value })
              }
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center cursor-pointer">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-gray-500 mt-1">Currently only email is supported for therapist communication.</p>
          </div>

          <div>
            <Label htmlFor="therapist-email">Email Address *</Label>
            <Input
              id="therapist-email"
              type="email"
              value={therapistInfo.email}
              onChange={(e) => setTherapistInfo({ ...therapistInfo, email: e.target.value })}
              placeholder="sarah.johnson@example.com"
            />
          </div>

          <div>
            <Label>Would you like to share your Current History Report?</Label>
            <RadioGroup 
              value={shareReport} 
              onValueChange={setShareReport}
              className="mt-2"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="yes" id="share-yes" />
                <Label htmlFor="share-yes" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Yes, share my Current History Report</div>
                    <div className="text-sm text-gray-500">Include Download History Report with anxiety trends and analytics</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="no" id="share-no" />
                <Label htmlFor="share-no" className="cursor-pointer">
                  <div>
                    <div className="font-medium">No, just send connection request</div>
                    <div className="text-sm text-gray-500">Only notify them about the connection without sharing reports</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="therapist-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="therapist-notes"
              value={therapistInfo.notes}
              onChange={(e) => setTherapistInfo({ ...therapistInfo, notes: e.target.value })}
              placeholder="Any additional information about your therapist or treatment..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep('question')}>
            Back
          </Button>
          <Button onClick={handleSubmitTherapistInfo} className="bg-blue-600 hover:bg-blue-700">
            Continue
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Therapist Information Saved
      </h2>
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-2">Review Information:</h3>
        <p><strong>Name:</strong> {therapistInfo.name}</p>
        <p><strong>Email:</strong> {therapistInfo.email}</p>
        <p><strong>Share Report:</strong> {shareReport === 'yes' ? 'Yes, include Current History Report' : 'No, connection request only'}</p>
        {therapistInfo.notes && <p><strong>Notes:</strong> {therapistInfo.notes}</p>}
      </div>
      <p className="text-gray-600 mb-6">
        Click below to send a connection request to your therapist. They'll receive an email 
        {shareReport === 'yes' 
          ? ' with your Current History Report including anxiety trends and analytics.' 
          : ' informing them about the connection request.'
        }
      </p>
      <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
        Send Connection Request
      </Button>
    </Card>
  );
};

export default TherapistLinking;
