
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Phone, ArrowRight, Check } from 'lucide-react';
import { AuthService } from '@/services/authService';

interface PhoneAuthProps {
  onSuccess?: () => void;
}

const PhoneAuth = ({ onSuccess }: PhoneAuthProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AuthService.sendOTP(phoneNumber);

      if (result.success) {
        setStep('otp');
        toast({
          title: "OTP sent!",
          description: `Verification code sent to ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Error sending OTP",
          description: result.error?.message || "Failed to send verification code",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AuthService.verifyOTP(phoneNumber, otpCode);

      if (result.success) {
        toast({
          title: "Phone verified!",
          description: "Successfully signed in with phone number",
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Verification failed",
          description: result.error?.message || "Failed to verify code",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep('phone');
    setOtpCode('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, spaces, dashes, parentheses, and plus sign
    const sanitized = e.target.value.replace(/[^0-9\s\-\(\)\+]/g, '');
    setPhoneNumber(sanitized);
  };

  const handleOTPChange = (value: string) => {
    // Only allow numeric input
    const sanitized = value.replace(/[^0-9]/g, '');
    setOtpCode(sanitized);
  };

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verify your phone number
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Enter the 6-digit code sent to {phoneNumber}
          </p>
        </div>

        <form onSubmit={verifyOTP} className="space-y-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={handleOTPChange}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading || otpCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              <Check className="w-4 h-4 ml-2" />
            </Button>

            <Button 
              type="button" 
              variant="outline"
              className="w-full"
              onClick={goBack}
              disabled={isLoading}
            >
              Change Phone Number
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sign in with Phone Number
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Enter your phone number to receive a verification code
        </p>
      </div>

      <form onSubmit={sendOTP} className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+1 (555) 123-4567"
            maxLength={17}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Include country code (e.g., +1 for US, +44 for UK, +91 for India)
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading || !phoneNumber.trim()}
        >
          {isLoading ? 'Sending...' : 'Send Verification Code'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );
};

export default PhoneAuth;
