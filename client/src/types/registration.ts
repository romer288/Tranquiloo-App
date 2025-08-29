export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  role: 'patient' | 'therapist';
}

export type RegistrationStep = 'registration' | 'registration-complete' | 'therapist-linking' | 'assessment' | 'complete';

export interface TherapistInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
  contactMethod: 'email' | 'phone';
}