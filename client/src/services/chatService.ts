// Chat service - migrated from Supabase to new API endpoints

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const chatService = {
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const response = await fetch(`/api/users/${userId}/chat-sessions`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  },

  async createChatSession(userId: string, title?: string): Promise<ChatSession> {
    try {
      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title: title || 'New Chat Session'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  async sendMessage(sessionId: string, content: string, role: 'user' | 'assistant' = 'user', userId?: string): Promise<ChatMessage> {
    try {
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          sessionId,
          content,
          sender: role,
          userId: userId || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Add missing saveMessage function
  async saveMessage(sessionId: string, content: string, role: 'user' | 'assistant' = 'user', userId?: string): Promise<ChatMessage> {
    return this.sendMessage(sessionId, content, role, userId);
  },

  // Add missing saveAnxietyAnalysis function
  async saveAnxietyAnalysis(messageId: string, analysis: any): Promise<void> {
    try {
      const response = await fetch('/api/anxiety-analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          messageId,
          userId: 'anonymous',
          ...analysis
        })
      });

      if (!response.ok) {
        console.warn('Failed to save anxiety analysis - continuing without error');
      }
    } catch (error) {
      console.warn('Error saving anxiety analysis:', error);
      // Don't throw error to prevent blocking chat flow
    }
  }
};