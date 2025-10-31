import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useNavigationContainerRef } from '@react-navigation/native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LoadingScreen } from '@/components/LoadingScreen';

// Splash Screen Component
function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0F1C' }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: '800', color: '#00D4FF', marginBottom: 16 }}>
          AFRIMED
        </Text>
        <Text style={{ fontSize: 16, color: '#8B9CB1', fontWeight: '500' }}>
          AI-Powered Medical Analysis
        </Text>
        <View style={{ marginTop: 32, flexDirection: 'row' }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#00D4FF', marginHorizontal: 4 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#00FF88', marginHorizontal: 4 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF0066', marginHorizontal: 4 }} />
        </View>
      </View>
    </View>
  );
}

// Auth State Handler - SIMPLIFIED VERSION
function AuthStateHandler() {
  const { user, session, loading, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    // wait until auth and router are both ready
    if (loading || !initialized) return;
    if (!navigationRef.isReady()) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    console.log("🔐 AuthStateHandler:", {
      user: !!user,
      session: !!session,
      inAuthGroup,
      inTabsGroup,
      segments,
    });

    if (session && user && inAuthGroup) {
      console.log("➡️ Redirecting to tabs (logged in)");
      router.replace("/(tabs)/home");
    } else if (!session && !user && inTabsGroup) {
      console.log("➡️ Redirecting to login (no session)");
      router.replace("/(auth)/login");
    }
  }, [user, session, loading, initialized, segments, navigationRef]);

  return null;
}

// Main Layout Component - MOVED INSIDE AuthProvider
function RootLayoutNav() {
  const { user, loading, initialized } = useAuth();

  // Show loading screen while initializing
  if (!initialized || loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0F1C' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan-result" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style="light" backgroundColor="#0A0F1C" />
    </>
  );
}

// Root Layout Component
export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          {/* AuthStateHandler must be inside AuthProvider to use useAuth */}
          <AuthStateHandler />
          {/* RootLayoutNav must be inside AuthProvider to use useAuth */}
          <RootLayoutNav />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Additional configuration for deep linking and navigation
export const navigationConfig = {
  screens: {
    '(auth)': {
      screens: {
        login: 'login',
        signup: 'signup',
        forgotpassword: 'forgot-password',
      },
    },
    '(tabs)': {
      screens: {
        home: 'home',
        scan: 'scan',
        clinics: 'clinics',
        profile: 'profile',
        donation: 'donation',
      },
    },
    'scan-result': 'scan-result/:scanId',
  },
};
