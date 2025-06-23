// app/(tabs)/chat/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { TouchableOpacity, useColorScheme } from 'react-native';

export default function ChatLayout() {
  const colorScheme = useColorScheme();

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
          headerRight: () => (
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
          ),
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