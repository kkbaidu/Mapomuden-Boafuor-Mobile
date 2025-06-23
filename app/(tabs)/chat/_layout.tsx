// app/(tabs)/chat/_layout.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, useColorScheme, View } from 'react-native';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export default function ChatLayout() {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const { token, isAuthenticated } = useAuthContext();
  const colorScheme = useColorScheme();
  
  // Get the session_id from params to determine if it's an old conversation
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  
  // Hide buttons if old conversation is loaded
  const isOldConversation = Boolean(session_id);

  const createNewSession = async () => {
      if (isCreatingSession) return;
  
      try {
        setIsCreatingSession(true);
        router.replace({
          pathname: '/chat',
        });
        
      } catch (error) {
        console.error('Failed to create new session:', error);
        Alert.alert('Error', 'Failed to create new chat session. Please try again.');
      } finally {
        setIsCreatingSession(false);
      }
    };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#2563EB',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'AI Assistant',
          headerRight: () => {
            // Don't show buttons if old conversation is loaded
            if (isOldConversation) {
              return null;
            }
            
            return (
              <View className='flex flex-row items-center justify-center gap-x-4'>
                <TouchableOpacity
                  onPress={createNewSession}
                  disabled={isCreatingSession}
                  className="w-7 h-7 rounded-full bg-blue-600 items-center justify-center shadow-sm active:bg-blue-700"
                >
                  {isCreatingSession ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="add" size={24} color="white" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/chat/history')}
                  className="mr-4"
                >
                  <Ionicons 
                    name="time-outline" 
                    size={24} 
                    color={colorScheme === 'dark' ? '#ffffff' : '#2563EB'} 
                  />
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Chat History',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}