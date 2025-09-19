import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export const IframeWarning = () => {
  const [isInIframe, setIsInIframe] = useState(false);
  const [isIPhone, setIsIPhone] = useState(false);

  useEffect(() => {
    // Detect if we're in an iframe
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);
    
    // Detect iPhone/iPad (but not Mac Safari which works fine)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIPhone(isIOSDevice);
  }, []);

  const openInNewTab = () => {
    // Get the current URL without iframe context
    const currentUrl = window.location.href;
    window.open(currentUrl, '_blank');
  };

  // Only show warning if we're in iframe AND on iPhone/iPad
  if (!isInIframe || !isIPhone) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <ExternalLink className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>
            For the best sign-in experience on iPhone/iPad, please open this app in a new tab.
          </span>
          <Button 
            onClick={openInNewTab}
            variant="outline" 
            size="sm"
            className="ml-2"
          >
            Open in New Tab
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};