
import { z } from 'zod';

// Input validation schemas
export const phoneNumberSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number cannot exceed 15 digits')
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const otpSchema = z.string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

export const messageSchema = z.string()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message cannot exceed 2000 characters')
  .trim();

export const sessionTitleSchema = z.string()
  .min(1, 'Title cannot be empty')
  .max(100, 'Title cannot exceed 100 characters')
  .trim();

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
};

// Validation functions
export const validateAndSanitizeMessage = (message: string): { isValid: boolean; sanitized: string; error?: string } => {
  try {
    const sanitized = sanitizeInput(message);
    messageSchema.parse(sanitized);
    return { isValid: true, sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, sanitized: message, error: error.errors[0].message };
    }
    return { isValid: false, sanitized: message, error: 'Invalid input' };
  }
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; formatted: string; error?: string } => {
  try {
    const sanitized = sanitizePhoneNumber(phone);
    phoneNumberSchema.parse(sanitized);
    return { isValid: true, formatted: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, formatted: phone, error: error.errors[0].message };
    }
    return { isValid: false, formatted: phone, error: 'Invalid phone number' };
  }
};

export const validateOTP = (otp: string): { isValid: boolean; error?: string } => {
  try {
    otpSchema.parse(otp);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid OTP' };
  }
};
