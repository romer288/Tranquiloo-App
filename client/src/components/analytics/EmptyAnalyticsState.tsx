
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EmptyAnalyticsState: React.FC = () => {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
      <p className="text-gray-600 mb-4">Start chatting with your AI companion to generate anxiety analytics data.</p>
      <Button onClick={() => window.location.href = '/chat'}>
        Start Chatting
      </Button>
    </Card>
  );
};

export default EmptyAnalyticsState;
