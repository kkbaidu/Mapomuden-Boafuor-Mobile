// app/(tabs)/appointments/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AppointmentsLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#2563EB" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563EB',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Appointments',
            headerStyle: {
              backgroundColor: '#2563EB',
            },
          }}
        />
        <Stack.Screen
          name="book"
          options={{
            title: 'Book Appointment',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: '#2563EB',
            },
          }}
        />
        <Stack.Screen
          name="details/[id]"
          options={{
            title: 'Appointment Details',
            headerStyle: {
              backgroundColor: '#2563EB',
            },
          }}
        />
      </Stack>
    </>
  );
}