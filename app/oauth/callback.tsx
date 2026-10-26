import LoadingScreen from '@/components/LoadingScreen';

/**
 * Landing screen for the OAuth redirect (com.fundaciondevalores.sigef://oauth/callback).
 *
 * On Android, Expo Router's own deep-link handling navigates here regardless of
 * expo-auth-session's native redirect capture — without this file it lands on
 * Unmatched Route. The actual code exchange happens in ScreenLogin's promptAsync
 * call chain; NavigationGuard in app/_layout.tsx redirects on from here once the
 * session updates.
 */
export default function OAuthCallback() {
  return <LoadingScreen />;
}
