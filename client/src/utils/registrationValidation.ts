import { FormData } from '@/types/registration';

export const validateRegistrationForm = (formData: FormData): { isValid: boolean; error?: { title: string; description: string } } => {
  if (!formData.firstName.trim()) {
    return {
      isValid: false,
      error: {
        title: "First Name Required",
        description: "Please enter your first name."
      }
    };
  }

  if (!formData.lastName.trim()) {
    return {
      isValid: false,
      error: {
        title: "Last Name Required", 
        description: "Please enter your last name."
      }
    };
  }

  if (!formData.email.trim()) {
    return {
      isValid: false,
      error: {
        title: "Email Required",
        description: "Please enter your email address."
      }
    };
  }

  if (formData.password.length < 6) {
    return {
      isValid: false,
      error: {
        title: "Password Too Short",
        description: "Password must be at least 6 characters long."
      }
    };
  }
  
  if (formData.password !== formData.confirmPassword) {
    return {
      isValid: false,
      error: {
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again."
      }
    };
  }

  if (!formData.agreeToTerms) {
    return {
      isValid: false,
      error: {
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy."
      }
    };
  }

  return { isValid: true };
};