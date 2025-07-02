// app/doctor/patients/_layout.tsx
import { Stack } from 'expo-router';

export default function PatientsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'My Patients',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Patient Details',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="records" 
        options={{ 
          headerShown: false // Let nested screens handle their own headers
        }} 
      />
    </Stack>
  );
}