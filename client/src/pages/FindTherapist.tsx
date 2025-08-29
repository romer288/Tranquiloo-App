import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Star, MapPin, Phone, Mail, Map, User, Shield, Loader2 } from 'lucide-react';
import TherapistLinking from '@/components/TherapistLinking';
import { therapistDataService } from '@/services/therapistDataService';

// TherapistData type (migrate locally for now)
interface TherapistData {
  id: string;
  name: string;
  specialty: string[];
  location: { city: string; state: string; };
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  acceptsInsurance?: boolean;
  acceptsUninsured?: boolean;
  address?: string;
  bio?: string;
  licensure?: string[];
  insurance?: string[];
  yearsOfExperience?: number;
  acceptingPatients?: boolean;
}
import { useToast } from '@/components/ui/use-toast';

// Using TherapistData from service instead of local interface

const FindTherapist = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<'therapist-check' | 'download-info' | 'insurance-check' | 'search' | 'results'>('therapist-check');
  const [hasInsurance, setHasInsurance] = useState<string>('');
  const [zipCode, setZipCode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [insuranceType, setInsuranceType] = useState('');
  const [therapists, setTherapists] = useState<TherapistData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Removed static therapist data - will use web scraped data

  const handleTherapistLinking = (hasTherapist: boolean, therapistInfo?: any) => {
    if (hasTherapist) {
      // Redirect to dashboard since they already have a therapist
      window.location.href = '/dashboard';
    } else {
      // Ask about downloading information instead of searching
      setStep('download-info');
    }
  };

  const handleInsuranceResponse = (value: string) => {
    setHasInsurance(value);
    setStep('search');
  };

  const handleSearch = async () => {
    if (!zipCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ZIP code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const searchParams = {
        zipCode: zipCode.trim(),
        specialty: specialty || undefined,
        insuranceType: hasInsurance === 'yes' ? insuranceType : undefined,
        acceptsUninsured: hasInsurance === 'no'
      };

      console.log('Searching for therapists:', searchParams);
      
      const result = await therapistDataService.searchCachedTherapists(searchParams);
      
      if (result.success && result.data) {
        setTherapists(result.data);
        setStep('results');
        toast({
          title: "Success",
          description: `Found ${result.data.length} therapists in your area`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to find therapists",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching therapists:', error);
      toast({
        title: "Error",
        description: "Failed to search for therapists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Therapists are already filtered by the search service

  if (step === 'therapist-check') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Connect Your Therapist</h1>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-12">
          <TherapistLinking onComplete={handleTherapistLinking} />
        </div>
      </div>
    );
  }

  if (step === 'download-info') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Contact Therapist</h1>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-12">
          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Download Your Information
              </h2>
              <p className="text-gray-600 mb-6">
                Since you don't have a therapist yet, would you like to download your anxiety tracking data and progress reports to share with a future therapist?
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => {
                  // TODO: Implement download functionality
                  console.log('Download anxiety data');
                }} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Download My Anxiety Data
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'insurance-check') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Contact Therapist</h1>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-12">
          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Do you have health insurance?
              </h2>
              <p className="text-gray-600">
                This helps us find therapists that match your coverage and budget.
              </p>
            </div>

            <RadioGroup value={hasInsurance} onValueChange={handleInsuranceResponse} className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="yes" id="yes-insurance" />
                <Label htmlFor="yes-insurance" className="text-gray-900 cursor-pointer font-medium">
                  Yes, I have health insurance
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="no" id="no-insurance" />
                <Label htmlFor="no-insurance" className="text-gray-900 cursor-pointer font-medium">
                  No, I don't have insurance (show self-pay options)
                </Label>
              </div>
            </RadioGroup>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'search') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Contact Therapist</h1>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Find a Therapist</h2>
            <p className="text-gray-600 mb-6">
              {hasInsurance === 'yes' 
                ? 'Connect with licensed therapists that accept your insurance.'
                : 'Find therapists offering affordable self-pay options for anxiety management.'
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="zipcode">Your ZIP Code</Label>
                <Input
                  id="zipcode"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
              
              {hasInsurance === 'yes' && (
                <div>
                  <Label htmlFor="insurance">Insurance Provider</Label>
                  <Select value={insuranceType} onValueChange={setInsuranceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapistDataService.getCommonInsuranceTypes().map((insurance) => (
                        <SelectItem key={insurance.toLowerCase().replace(/\s+/g, '-')} value={insurance}>
                          {insurance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                    <SelectContent>
                      {therapistDataService.getAnxietySpecialties().map((spec) => (
                        <SelectItem key={spec.toLowerCase().replace(/\s+/g, '-')} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Therapists'
              )}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Contact Therapist</h1>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {hasInsurance === 'yes' ? 'Therapists accepting your insurance' : 'Therapists with self-pay options'}
              </h3>
              <p className="text-gray-600">
                {therapists.length} therapist{therapists.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <Button variant="outline" onClick={() => setStep('search')}>
              Modify Search
            </Button>
          </div>

        {therapists.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No therapists found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or expanding your location radius.
            </p>
            <Button onClick={() => setStep('search')} variant="outline">
              Modify Search
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {therapists.map((therapist) => (
              <Card key={therapist.id} className="p-6">
                
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{therapist.name}</h4>
                        <p className="text-gray-600">{therapist.licensure}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {therapist.specialty.map((spec, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      {therapist.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">{therapist.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{therapist.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{therapist.phone}</span>
                      </div>
                      {therapist.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{therapist.email}</span>
                        </div>
                      )}
                    </div>

                    {therapist.bio && (
                      <p className="text-sm text-gray-700 mb-4">{therapist.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {hasInsurance === 'yes' ? (
                        therapist.insurance && therapist.insurance.length > 0 ? (
                          therapist.insurance.map((plan: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {plan}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                            Contact for insurance verification
                          </span>
                        )
                      ) : (
                        therapist.acceptsUninsured ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            Self-pay accepted
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            Insurance required
                          </span>
                        )
                      )}
                      {therapist.yearsOfExperience && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          {therapist.yearsOfExperience} years experience
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm ${therapist.acceptingPatients ? 'text-green-600' : 'text-red-600'}`}>
                          {therapist.acceptingPatients ? 'Accepting new patients' : 'Not accepting new patients'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {therapist.website && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={therapist.website} target="_blank" rel="noopener noreferrer">
                              Website
                            </a>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!therapist.acceptingPatients}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindTherapist;
