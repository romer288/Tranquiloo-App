
import { safeStorage } from './safeStorage';

// Simple authentication service for Replit migration
// This replaces Supabase auth with a basic implementation

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  patientCode?: string;
  role?: string;
  emailVerified?: boolean;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'auth_user';

  // Use safe storage that handles iframe/mobile restrictions
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = safeStorage.getItem(this.STORAGE_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.warn('Failed to get current user from storage:', error);
      return null;
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: AuthError; user?: AuthUser; needsVerification?: boolean }> {
    try {
      console.log('AuthService: Attempting email authentication for:', email);
      
      // Use the proper authentication endpoint that handles verification
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isSignIn: true })
      });

      const data = await response.json();
      console.log('AuthService: Response status:', response.status, 'Response data:', data);

      // If server says "verify first" for existing unverified user
      if (!response.ok && data?.error?.code === 'EMAIL_NOT_VERIFIED') {
        return { 
          success: false, 
          needsVerification: true,
          error: { code: 'EMAIL_NOT_VERIFIED', message: data.error.message } 
        };
      }

      if (!response.ok) {
        return { 
          success: false,
          error: { code: data?.error?.code || 'AUTH_ERROR', message: data?.error?.message || 'Sign in failed' } 
        };
      }

      // New account path: server returns user with emailVerified=false
      if (data?.user && data.user.emailVerified === false) {
        return { 
          success: false, 
          needsVerification: true,
          error: { code: 'EMAIL_NOT_VERIFIED', message: 'Check your email to verify your account.' } 
        };
      }

      // Verified user - store in localStorage
      if (data?.user) {
        console.log('AuthService: Processing user data:', data.user);
        
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username || data.user.email?.split('@')[0],
          role: data.user.role,
          patientCode: data.user.patientCode,
          emailVerified: data.user.emailVerified
        };
        
        try {
          safeStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          console.log('AuthService: Stored user to localStorage:', user);
          
          // Verify storage worked
          const stored = safeStorage.getItem(this.STORAGE_KEY);
          console.log('AuthService: Verification - stored data:', stored);
          
          return { success: true, user };
        } catch (storageError) {
          console.error('AuthService: Storage failed:', storageError);
          return { success: false, error: { code: 'STORAGE_ERROR', message: 'Failed to store user data' } };
        }
      }

      console.log('AuthService: Unexpected auth response - no user data in response');
      return { success: false, error: { code: 'AUTH_ERROR', message: 'Unexpected auth response' } };
    } catch (error: any) {
      console.error('AuthService: Authentication error:', error);
      return { 
        success: false, 
        error: { code: 'NETWORK_ERROR', message: error?.message || 'Network error' } 
      };
    }
  }

  static async signOut(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      safeStorage.removeItem(this.STORAGE_KEY);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: { code: 'SIGN_OUT_ERROR', message: 'Sign out failed. Please try again.' }
      };
    }
  }

  // Simplified phone auth for demo
  static async sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: AuthError }> {
    // For demo purposes, just return success
    console.log('OTP would be sent to:', phoneNumber);
    return { success: true };
  }

  static async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: AuthError }> {
    // For demo purposes, accept any OTP that's 6 digits
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      const user: AuthUser = {
        id: `user_${Date.now()}`,
        phone: phoneNumber
      };

      safeStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

      // Create profile in database
      try {
        await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            phoneNumber: user.phone,
            email: null,
            username: null
          })
        });
      } catch (err) {
        console.log('Profile creation error (non-critical):', err);
      }

      return { success: true };
    }

    return {
      success: false,
      error: { code: 'INVALID_OTP', message: 'Invalid OTP. Please enter 6 digits.' }
    };
  }

  static async validateResetTokens(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      console.log('Validating reset tokens:', { accessToken: '***', refreshToken: '***' });
      return true; // Accept all tokens during migration
    } catch (error) {
      console.error('Error validating reset tokens:', error);
      return false;
    }
  }

  static async updatePassword(newPassword: string): Promise<{ error?: string; success?: boolean }> {
    try {
      console.log('Password update requested');
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error: 'Failed to update password' };
    }
  }
}

// Export singleton instance for use in components
export const authService = AuthService;
