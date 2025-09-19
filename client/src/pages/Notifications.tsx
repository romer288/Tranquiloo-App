import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Heart, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'anxiety' | 'treatment' | 'reminder' | 'achievement';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mock notifications based on anxiety and treatment levels
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Anxiety Level Alert',
        message: 'Your anxiety levels have been elevated for the past 3 days. Consider practicing breathing exercises or talking to your therapist.',
        type: 'anxiety',
        priority: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: '2',
        title: 'Treatment Progress',
        message: 'Great job! You\'ve completed 7 consecutive days of mood tracking. Keep up the good work!',
        type: 'achievement',
        priority: 'medium',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: false
      },
      {
        id: '3',
        title: 'Therapy Session Reminder',
        message: 'You have a therapy session scheduled for tomorrow at 2:00 PM. Don\'t forget to prepare your notes.',
        type: 'reminder',
        priority: 'medium',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        read: true
      },
      {
        id: '4',
        title: 'Weekly Check-in',
        message: 'Time for your weekly mental health check-in. How are you feeling this week?',
        type: 'treatment',
        priority: 'low',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
        read: true
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'anxiety':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'treatment':
        return <Heart className="w-5 h-5 text-blue-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {notification.timestamp.toLocaleDateString()} at{' '}
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`mt-2 ${
                      !notification.read ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {/* Action buttons based on notification type */}
                    {notification.type === 'anxiety' && (
                      <div className="mt-4 flex space-x-3">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/chat">Talk to AI Companion</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/track-anxiety">Track Your Mood</Link>
                        </Button>
                      </div>
                    )}
                    
                    {notification.type === 'treatment' && (
                      <div className="mt-4">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/analytics">View Progress</Link>
                        </Button>
                      </div>
                    )}
                    
                    {notification.type === 'reminder' && (
                      <div className="mt-4">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/find-therapist">View Therapist Info</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;