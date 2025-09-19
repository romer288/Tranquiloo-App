//Author: Harsh Dugar
// This file is about the chat history sidebar on the chat page with loading all the chat sessions of the user
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Search,
  MoreVertical
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  aiCompanion: 'vanessa' | 'monica';
  language: 'english' | 'spanish';
  createdAt: string;
  updatedAt: string;
}

interface ChatHistorySidebarProps {
  currentSessionId?: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  className?: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  currentSessionId,
  onSessionSelect,
  onNewChat,
  className = ""
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const { data: sessions = [], isLoading, refetch, error } = useQuery({
    queryKey: [`/api/users/${user?.id}/chat-sessions`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/chat-sessions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chat sessions: ${response.status}`);
      }
      const data = await response.json();
      return data;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });


  // Filter and sort sessions
  const filteredSessions = (sessions as ChatSession[])
    .filter(session =>
      !searchTerm ||
      session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.aiCompanion.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Group sessions by time period
  const groupSessionsByTime = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    sessions.forEach(session => {
      const date = new Date(session.updatedAt);
      if (isToday(date)) {
        groups.today.push(session);
      } else if (isYesterday(date)) {
        groups.yesterday.push(session);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  const sessionGroups = groupSessionsByTime(filteredSessions);

  const getSessionTitle = (session: ChatSession) => {
    if (session.title && session.title !== 'New Chat Session') {
      return session.title;
    }
    const date = format(new Date(session.createdAt), 'MMM d');
    const companion = session.aiCompanion === 'vanessa' ? 'Vanessa' : 'Mónica';
    return `${companion} - ${date}`;
  };

  const getCompanionColor = (companion: 'vanessa' | 'monica') => {
    return companion === 'vanessa' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700';
  };

  const formatTimeGroup = (groupKey: string) => {
    switch (groupKey) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'thisWeek': return 'This Week';
      case 'older': return 'Older';
      default: return groupKey;
    }
  };

  const SessionItem: React.FC<{ session: ChatSession }> = ({ session }) => {
    const isActive = currentSessionId === session.id;

    const handleSessionClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSessionSelect(session.id);
    };

    const handleOptionsClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      // TODO: Implement more options menu
    };

    return (
      <div
        className={`group relative rounded-lg p-3 mx-2 cursor-pointer transition-all duration-200 select-none border-2 border-transparent hover:border-blue-200 ${
          isActive
            ? 'bg-gray-100 text-gray-900 border-blue-300'
            : 'hover:bg-gray-50 text-gray-700'
        }`}
        onClick={handleSessionClick}
        onMouseDown={handleSessionClick} // Add mousedown as backup
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSessionSelect(session.id);
        }} // Add touch support
        onMouseEnter={() => {
          setHoveredSession(session.id);
        }}
        onMouseLeave={() => {
          setHoveredSession(null);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSessionClick(e as any);
          }
        }}
        style={{
          minHeight: '60px',
          zIndex: 100, // Increased z-index
          position: 'relative',
          pointerEvents: 'auto', // Explicitly ensure pointer events
          touchAction: 'manipulation' // Improve touch handling
        }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 min-w-0 pointer-events-none"> {/* Only the content is pointer-events-none */}
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getSessionTitle(session)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {format(new Date(session.updatedAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {hoveredSession === session.id && (
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded flex-shrink-0 pointer-events-auto"
              onClick={handleOptionsClick}
              style={{ zIndex: 101 }}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const GroupSection: React.FC<{ title: string; sessions: ChatSession[] }> = ({ title, sessions }) => {
    if (sessions.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-medium text-gray-500 mb-3 px-4 sticky top-0 bg-white py-2">
          {title}
        </h3>
        <div className="space-y-1">
          {sessions.map(session => (
            <SessionItem key={session.id} session={session} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`h-full max-h-full flex flex-col bg-white rounded-lg border border-gray-200 ${className}`}
      style={{ 
        position: 'relative', 
        zIndex: 50,
        isolation: 'isolate', // Creates a new stacking context
        minHeight: 0 // Allow flex shrinking
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200" style={{ position: 'relative', zIndex: 51 }}>
        <Button
          onClick={onNewChat}
          className="w-full justify-start text-left font-normal"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200" style={{ position: 'relative', zIndex: 51 }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 51 }}>
        <ScrollArea className="h-full" style={{ position: 'relative', zIndex: 52 }}>
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-medium mb-1">
                  {searchTerm ? 'No chats found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-gray-400">
                  {searchTerm ? 'Try a different search term' : 'Start chatting to see your history here'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <GroupSection title="Today" sessions={sessionGroups.today} />
                <GroupSection title="Yesterday" sessions={sessionGroups.yesterday} />
                <GroupSection title="This Week" sessions={sessionGroups.thisWeek} />
                <GroupSection title="Older" sessions={sessionGroups.older} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatHistorySidebar;