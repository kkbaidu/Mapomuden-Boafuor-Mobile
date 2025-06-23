import { useAuthContext } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = "http://192.168.0.65:3000/api";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image';
  metadata?: {
    aiModel?: string;
    confidence?: number;
  };
}

interface ChatSession {
  _id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
}

export default function ChatScreen() {
  const { token, isAuthenticated, user } = useAuthContext()
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chat session
  useEffect(() => {
    if (isAuthenticated && token) {
      initializeChatSession();
    }
  }, [isAuthenticated, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const initializeChatSession = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/chat/session`,
        { title: 'Health Chat' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { chatSession } = response.data;
      setSessionId(chatSession._id);
      
      // Transform messages for display
      const transformedMessages = chatSession.messages.map((msg: any, index: number) => ({
        id: `${index}`,
        sender: msg.sender === 'AI' || msg.sender === 'ai' ? 'ai' : 'user',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        type: msg.type?.toLowerCase() || 'text',
        metadata: msg.metadata
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      Alert.alert('Error', 'Failed to start chat session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {

    // console.log("Send AI message")

    if (!inputText.trim() || !sessionId || isTyping) return


    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText.trim();
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/message`,
        {
          sessionId,
          message: messageToSend,
          type: 'text'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { aiMessage } = response.data;
      
      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: aiMessage.content,
        timestamp: new Date(aiMessage.timestamp),
        type: 'text',
        metadata: aiMessage.metadata
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove user message on failure
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    
    return (
      <View
        key={message.id}
        className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <View className="flex-row items-end max-w-[80%]">
          {!isUser && (
            <View className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 items-center justify-center mr-2">
              <Ionicons name="medical" size={16} color="white" />
            </View>
          )}
          
          <View>
            <View
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? 'bg-blue-600 rounded-br-md'
                  : 'bg-gray-100 rounded-bl-md border border-gray-200'
              }`}
            >
              <Text
                className={`text-base leading-5 ${
                  isUser ? 'text-white' : 'text-gray-800'
                }`}
              >
                {message.content}
              </Text>
            </View>
            
            <Text
              className={`text-xs text-gray-500 mt-1 ${
                isUser ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.timestamp)}
              {message.metadata?.confidence && (
                <Text className="ml-2">
                  • {Math.round(message.metadata.confidence * 100)}% confidence
                </Text>
              )}
            </Text>
          </View>
          
          {isUser && (
            <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center ml-2">
              <Ionicons name="person" size={16} color="white" />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View className="mb-4 items-start">
        <View className="flex-row items-end max-w-[80%]">
          <View className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 items-center justify-center mr-2">
            <Ionicons name="medical" size={16} color="white" />
          </View>
          
          <View className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200">
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="text-gray-600 ml-2">AI is thinking...</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && messages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Starting chat session...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="never"
        >
          {messages.map(renderMessage)}
          {renderTypingIndicator()}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) + (Platform.OS === 'ios' ? 85 : 65) }]}>
          <View style={styles.inputWrapper}>
            <View style={styles.textInputContainer}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about your health..."
                placeholderTextColor="#9CA3AF"
                multiline
                style={styles.textInput}
                maxLength={1000}
              />
            </View>
            
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !isTyping ? '#2563EB' : '#D1D5DB'
                }
              ]}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.disclaimer}>
            This AI assistant provides general health information only. 
            Consult healthcare professionals for medical advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  textInputContainer: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    marginRight: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'center',
    minHeight: 28,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 8,
  },
});