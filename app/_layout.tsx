import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import LoadingScreen from '@/components/LoadingScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { clearCachedPdfs } from '@/lib/downloadPdf';
import '../global.css';

WebBrowser.maybeCompleteAuthSession();

/**
 * Redirects between the public screens and the authenticated app based on
 * the session, and shows the loading screen while it is being restored.
 */
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    /*
     * Public screens: the login (index, no segment) and app/oauth/callback.tsx
     * (the OAuth redirect's transitional landing screen). Everything else —
     * tabs and stack screens like reportar-hs — requires a session.
     */
    const first = segments[0] as string | undefined;
    const onPublicScreen = first === undefined || first === 'index' || first === 'oauth';
    if (!user && !onPublicScreen) {
      router.replace('/');
    } else if (user && onPublicScreen) {
      router.replace('/(tabs)/home');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) return <LoadingScreen />;

  return <>{children}</>;
}

/** App root: providers, default status bar style and the stack of screens. */
export default function RootLayout() {
  /** Cold start only — PDFs from the previous session are no longer in use. */
  useEffect(() => { clearCachedPdfs(); }, []);

  return (
    <SafeAreaProvider>
      {/* Dark icons by default (light screens); navy screens mount their own `light` StatusBar */}
      <StatusBar style="dark" />
      <KeyboardProvider>
        <AuthProvider>
          <NavigationGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="reportar-hs" />
              <Stack.Screen name="historial-hs" />
              <Stack.Screen name="editar-metas" />
              <Stack.Screen name="configurar-plan" />
              <Stack.Screen name="cambiar-contrasena" />
              <Stack.Screen name="oauth/callback" />
            </Stack>
          </NavigationGuard>
        </AuthProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
