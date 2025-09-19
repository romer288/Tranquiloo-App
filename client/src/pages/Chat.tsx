
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import ChatContainer from '@/containers/ChatContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import { History, MessageSquare, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  userId: string;
  companionType: 'vanessa' | 'monica';
  sessionTitle?: string;
  sessionSummary?: string;
  anxietyLevel?: number;
  createdAt: string;
  updatedAt: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessionId);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for therapist mode from navigation state
  const [therapistMode, setTherapistMode] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if navigated from Treatment Resources with therapist connection intent
    if (location.pathname.includes('/chat') && location.state?.therapistMode) {
      setTherapistMode(true);
      setInitialMessage(location.state.initialMessage);
    }
  }, [location]);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/chat-sessions`],
    enabled: !!user?.id,
  });

  // Filter out current session from history
  const historySessions = (sessions as ChatSession[]).filter((session: ChatSession) => 
    session.id !== selectedSessionId
  ).slice(0, 10); // Show last 10 sessions

  const getSessionTitle = (session: ChatSession) => {
    if (session.sessionTitle) return session.sessionTitle;
    const date = format(new Date(session.createdAt), 'MMM d');
    const companion = session.companionType === 'vanessa' ? 'Vanessa' : 'Monica';
    return `${companion} - ${date}`;
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    window.location.href = `/chat?session=${sessionId}`;
  };

  return (
    <div className="h-full">
      <ChatContainer 
        sessionId={selectedSessionId}
      />
    </div>
  );
};

export default Chat;
