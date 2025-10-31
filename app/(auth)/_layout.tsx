import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthLayout() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated and tries to access auth pages, redirect to tabs
    if (initialized && user) {
      console.log('User already authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [user, initialized]);

  // Don't render anything until auth is initialized
  if (!initialized) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
          gestureEnabled: false
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            animation: 'slide_from_left'
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
