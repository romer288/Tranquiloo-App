import { AlertCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IOSAuthFallbackProps {
  onUseEmailInstead: () => void;
  isVisible: boolean;
}

export default function IOSAuthFallback({ onUseEmailInstead, isVisible }: IOSAuthFallbackProps) {
  if (!isVisible) return null;
  
  return (
    <Alert className="mt-4 border-amber-200 bg-amber-50">
      <Smartphone className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm text-amber-800">
        <div className="mb-3">
          <strong>Having trouble with Gmail sign-in on iPhone?</strong>
        </div>
        <div className="mb-2">
          Gmail authentication can sometimes have issues with iPhone Safari. 
          Here are two solutions:
        </div>
        <div className="space-y-2">
          <div className="text-xs">
            • <strong>Try Chrome app:</strong> Open this page in Chrome iOS app instead of Safari
          </div>
          <div className="text-xs">
            • <strong>Use email login:</strong> Create account with email and password instead
          </div>
        </div>
        <Button 
          onClick={onUseEmailInstead}
          variant="outline"
          size="sm"
          className="mt-3 w-full bg-white"
        >
          Use Email Login Instead
        </Button>
      </AlertDescription>
    </Alert>
  );
}