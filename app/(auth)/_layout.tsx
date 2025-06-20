import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Reset Password',
          headerTintColor: '#3B82F6',
          headerShown: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="verify-otp"
        options={{
          title: 'Verify OTP',
          headerTintColor: '#3B82F6',
          headerShown: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: 'Reset Password',
          headerTintColor: '#3B82F6',
          headerShown: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack>
  );
}