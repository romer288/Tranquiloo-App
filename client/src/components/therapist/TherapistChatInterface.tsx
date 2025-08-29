import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Bot, User, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'therapist' | 'vanessa';
  timestamp: string;
}

interface TherapistChatInterfaceProps {
  patientId: string;
  patientName: string;
}

const TherapistChatInterface: React.FC<TherapistChatInterfaceProps> = ({ 
  patientId, 
  patientName 
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message from Vanessa
    setMessages([
      {
        id: '1',
        content: `Hello Doctor! I'm Vanessa, your AI assistant. I can help you with questions about Patient X's treatment, progress, and therapeutic strategies. All patient data is anonymized for HIPAA compliance. How can I assist you today?`,
        sender: 'vanessa',
        timestamp: new Date().toISOString()
      }
    ]);
  }, [patientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'therapist',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to AI with therapeutic context
      const response = await fetch('/api/therapist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          patientId: patientId,
          context: 'therapist_consultation'
        })
      });

      if (response.ok) {
        const { reply } = await response.json();
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: reply,
          sender: 'vanessa',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* HIPAA Compliance Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">HIPAA Compliance Notice</p>
            <p className="text-sm text-yellow-700">
              All patient data is anonymized as "Patient X" when communicating with AI. 
              No PHI is transmitted to external AI models.
            </p>
          </div>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat with Vanessa - AI Therapeutic Assistant
          </CardTitle>
          <p className="text-sm text-gray-600">
            Discussing treatment for: {patientName}
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'therapist' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`flex gap-3 max-w-[80%] ${
                  message.sender === 'therapist' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className="flex-shrink-0">
                    {message.sender === 'vanessa' ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    message.sender === 'therapist' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'therapist' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Vanessa about Patient X's treatment, progress, or therapeutic strategies..."
              className="flex-1"
              disabled={isLoading}
              data-testid="input-therapist-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => setInputMessage("What therapeutic interventions would you recommend for Patient X based on their current anxiety patterns?")}
          data-testid="button-quick-interventions"
        >
          Suggest Interventions
        </Button>
        <Button
          variant="outline"
          onClick={() => setInputMessage("How has Patient X's anxiety levels progressed over the past week?")}
          data-testid="button-quick-progress"
        >
          Progress Update
        </Button>
        <Button
          variant="outline"
          onClick={() => setInputMessage("What goals should we set for Patient X's next treatment phase?")}
          data-testid="button-quick-goals"
        >
          Goal Setting
        </Button>
      </div>
    </div>
  );
};

export default TherapistChatInterface;