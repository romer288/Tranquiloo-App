// Google OAuth service for Gmail authentication
import { AuthUser } from './authService';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export class GoogleAuthService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Skip Google Identity Services initialization on iPhone/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS || isSafari) {
      console.log('iPhone/Safari detected, skipping Google Identity Services initialization');
      this.isInitialized = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Get Google Client ID from environment
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          reject(new Error('Google Client ID not configured'));
          return;
        }

        // Get the current domain for redirect URI
        const currentDomain = window.location.origin;
        console.log('Initializing Google OAuth for domain:', currentDomain);
        
        // Initialize Google Identity Services with proper configuration
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: this.handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM to avoid cross-origin issues
          ux_mode: 'popup',
          context: 'signin'
        });
        
        this.isInitialized = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);
    });
  }

  static handleCredentialResponse = (response: GoogleCredentialResponse) => {
    // This will be called when user completes OAuth
    console.log('Google credential response received:', response);
    
    // Store the credential for processing
    sessionStorage.setItem('google_credential', response.credential);
    
    // Trigger a custom event that our auth hook can listen to
    window.dispatchEvent(new CustomEvent('google-auth-success', {
      detail: { credential: response.credential }
    }));
  };

  static async signIn(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Check if we're on iPhone Safari - use redirect flow instead of popup
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isIOS || isSafari) {
        // Use server-side redirect flow for iPhone Safari
        console.log('iPhone/Safari detected, using server-side OAuth flow');
        window.location.href = '/auth/google';
        return { success: false, error: 'Redirecting to Google OAuth...' };
      }
      
      // For other browsers, try the popup flow
      await this.initialize();
      
      return new Promise((resolve) => {
        // Set up event listener for successful authentication
        const handleAuthSuccess = (event: Event) => {
          const credential = (event as CustomEvent).detail.credential;

          // Decode JWT token to get user info
          const payload = this.parseJwtPayload(credential);
          
          if (payload) {
            const user: AuthUser = {
              id: payload.sub,
              email: payload.email,
              username: payload.email?.split('@')[0] || payload.name
            };
            
            resolve({ success: true, user });
          } else {
            resolve({ success: false, error: 'Failed to parse user data' });
          }
          
          // Clean up listener
          window.removeEventListener('google-auth-success' as any, handleAuthSuccess as EventListener);
        };

        window.addEventListener('google-auth-success' as any, handleAuthSuccess as EventListener);
        
        // Trigger the Google sign-in popup
        try {
          window.google.accounts.id.prompt();
        } catch (error) {
          console.error('Popup blocked, falling back to redirect:', error);
          window.location.href = '/auth/google';
          resolve({ success: false, error: 'Redirecting to Google OAuth...' });
        }
        
        // Set a timeout in case user cancels
        setTimeout(() => {
          window.removeEventListener('google-auth-success' as any, handleAuthSuccess as EventListener);
          resolve({ success: false, error: 'Sign-in cancelled or timed out' });
        }, 30000); // 30 second timeout
      });
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Fallback to server-side flow
      window.location.href = '/auth/google';
      return { 
        success: false, 
        error: 'Redirecting to server-side authentication...'
      };
    }
  }

  private static parseJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  static renderButton(element: HTMLElement, options: any = {}) {
    if (!this.isInitialized) {
      console.warn('Google Auth not initialized. Call initialize() first.');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      ...options
    });
  }
}