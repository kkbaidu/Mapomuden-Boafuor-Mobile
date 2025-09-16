// app/doctor/patients/_layout.tsx
import { Stack } from "expo-router";

export default function PatientsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "My Patients",
          headerShown: false,
          headerStyle: {
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Patient Details",
          headerShown: false,
          headerStyle: {
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="vitals/[id]"
        options={{
          title: "Add Vital Signs",
          headerShown: false,
          headerStyle: {
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="records"
        options={{
          headerShown: false, // Let nested screens handle their own headers
        }}
      />
    </Stack>
  );
}
