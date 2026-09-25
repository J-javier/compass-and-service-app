import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import '../global.css';

WebBrowser.maybeCompleteAuthSession();

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    // Public screens: the login (index, no segment) and app/oauth/callback.tsx
    // (the OAuth redirect's transitional landing screen). Everything else —
    // tabs and stack screens like reportar-hs — requires a session.
    const first = segments[0] as string | undefined;
    const onPublicScreen = first === undefined || first === 'index' || first === 'oauth';
    if (!user && !onPublicScreen) {
      router.replace('/');
    } else if (user && onPublicScreen) {
      router.replace('/(tabs)/home');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#08203e' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reportar-hs" />
            <Stack.Screen name="historial-hs" />
            <Stack.Screen name="editar-metas" />
            <Stack.Screen name="configurar-plan" />
            <Stack.Screen name="oauth/callback" />
          </Stack>
        </NavigationGuard>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
