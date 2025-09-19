
import React from 'react';
import { Card } from '@/components/ui/card';

const RecentEntriesCard: React.FC = () => {
  return (
    <Card className="p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Entries</h3>
      <p className="text-gray-600 mb-6">Your last 5 anxiety tracking sessions</p>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-900">Level: Not recorded</p>
            <p className="text-sm text-gray-500">No trigger specified</p>
          </div>
          <p className="text-sm text-gray-500">6/15/2025</p>
        </div>
      </div>
    </Card>
  );
};

export default RecentEntriesCard;
