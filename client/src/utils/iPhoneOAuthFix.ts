// iPhone-specific OAuth handling utilities

export const iPhoneOAuthUtils = {
  // Detect if user is on iPhone
  isIPhone: () => /iPhone|iPad|iPod/.test(navigator.userAgent),
  
  // Check if user is using Safari specifically  
  isIOSSafari: () => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
    return isIOS && isSafari;
  },
  
  // Create alternative OAuth flow for iPhone users
  createAlternativeOAuth: (clientId: string, callback: (response: any) => void) => {
    try {
      // Use a more compatible OAuth approach for iOS
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: false,
        ux_mode: 'popup',
        use_fedcm_for_prompt: false,
        context: 'signin',
        // Additional iOS-specific configurations
        itp_support: true,
        login_uri: window.location.origin,
        // Use current origin as authorized domain
        hosted_domain: undefined
      });
      
      // Create custom button for better iOS compatibility
      const buttonDiv = document.createElement('div');
      buttonDiv.id = 'google-signin-custom';
      
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        width: 300,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });
      
      return buttonDiv;
      
    } catch (error) {
      console.error('iPhone OAuth setup failed:', error);
      return null;
    }
  },
  
  // Provide iPhone users with clear instructions
  getIOSInstructions: () => {
    return {
      title: "iPhone OAuth Issues",
      message: "Gmail login may not work properly in iPhone Safari due to browser restrictions.",
      solutions: [
        "Use email registration instead (100% reliable)",
        "Try opening this page in Chrome app",
        "Add this page to your Home Screen for better compatibility"
      ]
    };
  },
  
  // Check if current URL is properly configured for OAuth
  validateOAuthURL: () => {
    const currentURL = window.location.origin;
    console.log('Current OAuth URL:', currentURL);
    
    // Check if we're on a secure HTTPS connection
    const isSecure = window.location.protocol === 'https:';
    
    // Check if we're on a Replit domain
    const isReplit = currentURL.includes('replit.dev');
    
    return {
      isSecure,
      isReplit,
      currentURL,
      isValid: isSecure && isReplit
    };
  }
};