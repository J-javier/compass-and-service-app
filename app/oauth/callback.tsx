import { ActivityIndicator, View } from 'react-native';

// Matches the OAuth redirect URI's path (com.fundaciondevalores.sigef://oauth/callback).
// On Android, Expo Router's own deep-link handling navigates here regardless of
// expo-auth-session's native redirect capture — without this file it lands on
// Unmatched Route. The actual code exchange happens in ScreenLogin's promptAsync
// call chain; NavigationGuard in app/_layout.tsx redirects on from here once the
// session updates.
export default function OAuthCallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#08203e' }}>
      <ActivityIndicator size="large" color="#38bdf8" />
    </View>
  );
}
