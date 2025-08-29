import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, AlertTriangle, Shield, FileText, Clock4 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

export default function TherapistLicenseVerification() {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user email from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const storedUser = localStorage.getItem('user');
    
    let email = emailFromUrl;
    if (!email && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        email = parsedUser.email;
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    
    if (email) {
      setUserEmail(email);
      checkLicenseStatus(email);
    } else {
      toast({
        title: "Error",
        description: "No therapist email found. Please contact support.",
        variant: "destructive"
      });
    }
  }, []);

  const checkLicenseStatus = async (email: string) => {
    try {
      const response = await fetch(`/api/therapist/license-status/${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.success) {
        setLicenseStatus(data);
        
        // If already has license, redirect to dashboard
        if (data.hasLicense) {
          window.location.href = '/therapist-dashboard';
        }
      }
    } catch (error) {
      console.error('Failed to check license status:', error);
    }
  };

  const handleLicenseSubmission = async () => {
    if (!licenseNumber.trim() || !selectedState) {
      toast({
        title: "Missing Information",
        description: "Please provide both license number and state/province.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/therapist/license-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          licenseNumber: licenseNumber.trim(),
          state: selectedState
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "License Verified",
          description: "Your license has been verified successfully!",
          variant: "default"
        });
        
        // Wait briefly for the success message, then redirect
        setTimeout(() => {
          window.location.href = '/therapist-dashboard';
        }, 2000);
      } else {
        toast({
          title: "Verification Failed",
          description: data.error?.message || "Failed to verify license. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('License verification error:', error);
      toast({
        title: "Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/therapist/license-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          skip: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Grace Period Activated",
          description: "You have 24 hours to complete license verification.",
          variant: "default"
        });
        
        // Redirect to dashboard with grace period active
        setTimeout(() => {
          window.location.href = '/therapist-dashboard';
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: data.error?.message || "Failed to process request. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Skip verification error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!licenseStatus) return null;

    if (licenseStatus.hasLicense) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">License Verified</span>
        </div>
      );
    }

    if (licenseStatus.inGracePeriod) {
      const deadline = new Date(licenseStatus.graceDeadline).toLocaleString();
      return (
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <Clock className="h-5 w-5" />
          <div>
            <div className="font-medium">Grace Period Active</div>
            <div className="text-sm">Deadline: {deadline}</div>
          </div>
        </div>
      );
    }

    if (licenseStatus.graceExpired) {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Grace Period Expired - License Required</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            License Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete your therapist verification to access the platform
          </p>
        </div>

        {getStatusDisplay()}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Professional License Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                US & Canada Therapists
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                As per our compliance requirements, therapists practicing in the United States and Canada 
                must provide their professional license number within 24 hours of account creation.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="Enter your professional license number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="mt-1"
                  data-testid="input-license-number"
                />
              </div>

              <div>
                <Label htmlFor="state">State/Province</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="mt-1" data-testid="select-state">
                    <SelectValue placeholder="Select your state or province" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* United States Section */}
                    <SelectItem value="us-header" disabled className="font-bold text-gray-500 cursor-default">
                      United States
                    </SelectItem>
                    {(US_STATES ?? []).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                    
                    {/* Canada Section */}
                    <SelectItem value="ca-header" disabled className="font-bold text-gray-500 cursor-default mt-2">
                      Canada
                    </SelectItem>
                    {(CANADIAN_PROVINCES ?? []).map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleLicenseSubmission}
                className="flex-1"
                disabled={isLoading}
                data-testid="button-submit-license"
              >
                {isLoading ? "Verifying..." : "Submit License Information"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipVerification}
                disabled={isLoading}
                className="flex-1"
                data-testid="button-skip-verification"
              >
                {isLoading ? "Processing..." : "Skip for Now (24hr Grace)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock4 className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p className="font-medium mb-1">Grace Period Policy</p>
                <p>
                  If you choose to skip verification now, you'll have 24 hours to complete it. 
                  After this period, your therapist access may be temporarily suspended until 
                  verification is complete.
                </p>
                <p className="mt-2">
                  <strong>Note:</strong> If you practice outside the US/Canada, you may skip this step permanently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact support at{" "}
            <a href="mailto:support@tranquiloo.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@tranquiloo.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}