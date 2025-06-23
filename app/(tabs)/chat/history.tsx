// app/(tabs)/chat/history.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = "http://192.168.0.65:3000/api";

interface ChatSession {
  _id: string;
  title: string;
  lastActivity: string;
  isActive: boolean;
  messages: Array<{
    sender: string;
    content: string;
    timestamp: string;
  }>;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function ChatHistoryScreen() {
  const { token, isAuthenticated } = useAuthContext();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      loadChatHistory();
    }
  }, [isAuthenticated, token]);

  const loadChatHistory = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await axios.get(
        `${API_BASE_URL}/chat/history?limit=10&offset=0`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { chatSessions: sessions, pagination: paginationInfo } = response.data;
      setChatSessions(sessions);
      setPagination(paginationInfo);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      Alert.alert('Error', 'Failed to load chat history. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMoreSessions = async () => {
    if (!pagination.hasMore || isLoading) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/history?limit=${pagination.limit}&offset=${pagination.offset + pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { chatSessions: moreSessions, pagination: newPagination } = response.data;
      setChatSessions(prev => [...prev, ...moreSessions]);
      setPagination(newPagination);
    } catch (error) {
      console.error('Failed to load more sessions:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessagePreview = (messages: ChatSession['messages']) => {
    if (messages.length === 0) return 'No messages';
    
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.length > 60 
      ? `${lastMessage.content.substring(0, 60)}...`
      : lastMessage.content;
    
    return lastMessage.sender === 'USER' ? `You: ${preview}` : preview;
  };

  const handleSessionPress = (sessionId: string) => {
    // Navigate back to chat with this session
    router.back();
    // TODO: Pass sessionId to chat screen to load specific session
  };

  const renderChatSession = (session: ChatSession) => {
    return (
      <TouchableOpacity
        key={session._id}
        onPress={() => handleSessionPress(session._id)}
        className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm active:bg-gray-50"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <Text className="text-base font-semibold text-gray-800 flex-1">
                {session.title}
              </Text>
            </View>
            
            <Text className="text-sm text-gray-600 mb-2 leading-5">
              {getLastMessagePreview(session.messages)}
            </Text>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500">
                {formatDate(session.lastActivity)}
              </Text>
              
              <View className="flex-row items-center">
                <Ionicons name="chatbubbles-outline" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {session.messages.length} messages
                </Text>
              </View>
            </View>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-4">
        <Ionicons name="chatbubbles-outline" size={40} color="#2563EB" />
      </View>
      
      <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
        No Chat History
      </Text>
      
      <Text className="text-gray-600 text-center mb-6 leading-6">
        Start a conversation with your AI health assistant to see your chat history here.
      </Text>
      
      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-blue-600 rounded-full px-6 py-3"
      >
        <Text className="text-white font-semibold">Start Chatting</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="text-gray-600 mt-2">Loading chat history...</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header Stats */}
      {!isLoading && chatSessions.length > 0 && (
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-sm text-gray-600">
            {pagination.total} total conversations
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingState()
      ) : chatSessions.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadChatHistory(true)}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
          onMomentumScrollEnd={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            
            if (isCloseToBottom && pagination.hasMore) {
              loadMoreSessions();
            }
          }}
        >
          {chatSessions.map(renderChatSession)}
          
          {/* Load More Indicator */}
          {pagination.hasMore && (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="text-sm text-gray-500 mt-1">Loading more...</Text>
            </View>
          )}
          
          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}