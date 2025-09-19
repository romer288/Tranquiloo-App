import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Tts from 'react-native-tts';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Vanessa, your AI companion. I'm here to listen and support you through your mental health journey. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Configure TTS once
  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDucking(true);
    speak(messages[0].text);
  }, []);

  const speak = (text: string) => {
    if (!text) return;
    const isSpanish = /[\u00C0-\u00FF]/i.test(text);
    Tts.setDefaultLanguage(isSpanish ? 'es-MX' : 'en-US');
    Tts.speak(text);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulate AI response - in real app, this would call your backend
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Thank you for sharing that with me. I can hear that you're going through something, and I want you to know that your feelings are valid. Would you like to tell me more about what's on your mind?`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
        speak(aiResponse.text);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={styles.messageText}>{message.text}</Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Vanessa is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Share what's on your mind..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    padding: 12,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ChatScreen;