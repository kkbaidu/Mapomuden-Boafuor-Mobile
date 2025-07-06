// app/doctor/prescriptions/_layout.tsx
import { Stack } from 'expo-router';

export default function PrescriptionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: '#2563EB',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Prescriptions',
          headerShown: false, // Custom header in component
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          headerShown: false, // Let nested screens handle headers
        }} 
      />
    </Stack>
  );
}