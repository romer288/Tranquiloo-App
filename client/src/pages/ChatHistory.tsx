import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, Clock, Brain, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  userId: string;
  aiCompanion: 'vanessa' | 'monica';
  title?: string;
  sessionSummary?: string;
  anxietyLevel?: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'assistant';
  createdAt: string;
}

interface AnxietyAnalysis {
  id: string;
  anxietyLevel: number;
  anxietyTriggers: string[];
  copingStrategies: string[];
  personalizedResponse: string;
  analysisSource: string;
  createdAt: string;
}

const ChatHistory = () => {
  const { user } = useAuth();

  const { data: sessionsData = [], isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: [`/api/users/${user?.id}/chat-sessions`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/chat-sessions`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: analysesData = [], error: analysesError } = useQuery({
    queryKey: [`/api/users/${user?.id}/anxiety-analyses`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/anxiety-analyses`);
      if (!response.ok) {
        throw new Error('Failed to fetch anxiety analyses');
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Sessions and analyses are already filtered by user ID from the API
  const sessions = Array.isArray(sessionsData)
    ? sessionsData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];
  const recentAnalyses = Array.isArray(analysesData)
    ? analysesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const getAnxietyLevelColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getAnxietyLevelText = (level: number) => {
    if (level <= 3) return 'Low';
    if (level <= 6) return 'Moderate';
    return 'High';
  };

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6" data-testid="chat-history-container">
      <div className="flex items-center space-x-2">
        <History className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Chat History</h1>
      </div>
      <p className="text-muted-foreground" data-testid="text-page-description">
        Review your previous conversations and anxiety interventions
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Chat Sessions History */}
        <Card data-testid="card-chat-sessions">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Recent Conversations</span>
            </CardTitle>
            <CardDescription>
              Your chat sessions with AI companions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-sessions">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No chat sessions yet</p>
                  <p className="text-sm">Start a conversation to see your history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session: ChatSession) => (
                    <div key={session.id} className="border rounded-lg p-4 space-y-2" data-testid={`card-session-${session.id}`}>
                      {/* Main title - show actual conversation title or fallback */}
                      <h3 className="font-medium text-lg" data-testid={`text-session-title-${session.id}`}>
                        {session.title && session.title !== 'New Chat Session' ? session.title : 'Untitled Chat'}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            data-testid={`badge-companion-${session.aiCompanion}`}
                          >
                            {session.aiCompanion === 'vanessa' ? '🇺🇸 Vanessa' : '🇪🇸 Monica'}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span data-testid={`text-session-date-${session.id}`}>
                            {format(new Date(session.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      {session.sessionSummary && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-session-summary-${session.id}`}>
                          {session.sessionSummary}
                        </p>
                      )}
                      
                      {session.anxietyLevel && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Anxiety Level:</span>
                          <Badge 
                            className={getAnxietyLevelColor(session.anxietyLevel)}
                            data-testid={`badge-anxiety-level-${session.id}`}
                          >
                            {session.anxietyLevel}/10 - {getAnxietyLevelText(session.anxietyLevel)}
                          </Badge>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => window.location.href = `/chat?session=${session.id}`}
                        data-testid={`button-view-session-${session.id}`}
                      >
                        View Conversation
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Anxiety Analysis History */}
        <Card data-testid="card-anxiety-analyses">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Anxiety Interventions</span>
            </CardTitle>
            <CardDescription>
              AI-powered anxiety analysis and coping strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-analyses">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No anxiety analyses yet</p>
                  <p className="text-sm">Chat with our AI companions to receive personalized support</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis: AnxietyAnalysis) => (
                    <div key={analysis.id} className="border rounded-lg p-4 space-y-3" data-testid={`card-analysis-${analysis.id}`}>
                      <div className="flex items-center justify-between">
                        <Badge 
                          className={getAnxietyLevelColor(analysis.anxietyLevel)}
                          data-testid={`badge-analysis-level-${analysis.id}`}
                        >
                          {analysis.anxietyLevel}/10 - {getAnxietyLevelText(analysis.anxietyLevel)}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span data-testid={`text-analysis-date-${analysis.id}`}>
                            {format(new Date(analysis.createdAt), 'MMM d, HH:mm')}
                          </span>
                        </div>
                      </div>

                      {analysis.anxietyTriggers.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Identified Triggers:</h4>
                          <div className="flex flex-wrap gap-1" data-testid={`triggers-${analysis.id}`}>
                            {analysis.anxietyTriggers.map((trigger, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.copingStrategies.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Coping Strategies:</h4>
                          <div className="flex flex-wrap gap-1" data-testid={`strategies-${analysis.id}`}>
                            {analysis.copingStrategies.map((strategy, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {strategy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.personalizedResponse && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">AI Response:</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded" data-testid={`text-personalized-response-${analysis.id}`}>
                            {analysis.personalizedResponse}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span data-testid={`text-analysis-source-${analysis.id}`}>
                          Source: {analysis.analysisSource}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatHistory;