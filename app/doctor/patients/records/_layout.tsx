import { Stack } from 'expo-router';

export default function MedicalRecordsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[patientId]" 
        options={{ 
          title: 'Medical Records',
          headerShown: false,
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
