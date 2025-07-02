// app/doctor/patients/_layout.tsx
import { Stack } from 'expo-router';

export default function PatientsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Prescriptions',
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
        name="create/[patientId]" 
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
    </Stack>
  );
}