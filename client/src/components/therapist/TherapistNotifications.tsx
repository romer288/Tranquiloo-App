import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, CheckCircle, Clock } from 'lucide-react';

interface EmailNotification {
  id: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  htmlContent: string;
  emailType: string;
  status: string;
  metadata: string;
  createdAt: string;
}

interface TherapistNotificationsProps {
  therapistEmail: string;
}

const TherapistNotifications: React.FC<TherapistNotificationsProps> = ({ therapistEmail }) => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [therapistEmail]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/therapist/notifications/${encodeURIComponent(therapistEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseMetadata = (metadata: string | null) => {
    if (!metadata) return {};
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Loading Notifications...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-sm">Patient connection requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const metadata = parseMetadata(notification.metadata);
              return (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${
                    notification.status === 'pending' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {notification.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <h4 className="font-medium">{notification.subject}</h4>
                    </div>
                    <Badge 
                      variant={notification.status === 'pending' ? 'default' : 'secondary'}
                    >
                      {notification.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <div dangerouslySetInnerHTML={{ __html: notification.htmlContent }} />
                  </div>
                  
                  {notification.emailType === 'connection_request' && metadata.patientId && (
                    <div className="bg-white border rounded p-3 mt-3">
                      <h5 className="font-medium mb-2">Patient Details:</h5>
                      <ul className="text-sm space-y-1">
                        <li><strong>Patient ID:</strong> {metadata.patientId}</li>
                        <li><strong>Therapist:</strong> {metadata.therapistName}</li>
                        <li><strong>Report Sharing:</strong> {metadata.shareReport ? 'Yes' : 'No'}</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-3">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TherapistNotifications;