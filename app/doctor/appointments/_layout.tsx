// app/doctor/appointments/_layout.tsx
import { Stack } from 'expo-router';

export default function AppointmentsLayout() {
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
        contentStyle: {
          backgroundColor: '#f9fafb',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'My Appointments',
          headerShown: false, // Hide header since we have a custom one in the component
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Appointment Details',
          headerShown: false,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}