import React, { useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Emblem from '@/components/brand/Emblem';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { SIGEF_CLIENT_ID, SIGEF_DISCOVERY, SIGEF_REDIRECT_URI, SIGEF_SCOPES } from '@/constants/oidc';

const EMBLEM_SIZE = 170;
const RINGS = [{ size: 300, opacity: 0.1 }, { size: 236, opacity: 0.14 }];

/**
 * Emblem with faint concentric rings and a soft glow, always centered on it.
 * The screen itself is solid navy (same as the splash): a full-screen gradient
 * between two dark navies bands visibly on 8-bit displays. The glow is a small,
 * low-alpha circle, so its steps are too fine to notice.
 */
function EmblemWithRings() {
  const box = RINGS[0].size;
  return (
    <View style={{ width: box, height: box }} className="items-center justify-center">
      <Svg width={box} height={box} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glow" cx={box / 2} cy={box / 2} r={box / 2} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={COLORS.celeste} stopOpacity={0.14} />
            <Stop offset="1" stopColor={COLORS.celeste} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={box / 2} cy={box / 2} r={box / 2} fill="url(#glow)" />
        {RINGS.map((r) => (
          <Circle key={r.size} cx={box / 2} cy={box / 2} r={r.size / 2 - 1} fill="none" stroke={COLORS.celeste} strokeOpacity={r.opacity} />
        ))}
      </Svg>
      <Emblem size={EMBLEM_SIZE} />
    </View>
  );
}

/** Login (option A): brand emblem, app name and a single "Iniciar sesión" button. */
export default function ScreenLogin() {
  const insets = useSafeAreaInsets();
  const { completeLogin } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SIGEF_CLIENT_ID,
      scopes: SIGEF_SCOPES,
      redirectUri: SIGEF_REDIRECT_URI,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    },
    SIGEF_DISCOVERY,
  );

  /**
   * Runs the SIGEF OIDC flow and completes the session.
   *
   * Handles the prompt's own resolved result directly instead of watching the
   * hook's `response` state via a useEffect: on Android, Expo Router's own
   * deep-link handling also grabs the oauth/callback redirect and navigates
   * to it (see app/oauth/callback.tsx), which can unmount this screen before
   * a `response`-driven effect ever runs. Awaiting promptAsync() here is
   * unaffected by that navigation/unmount. On success, NavigationGuard in
   * app/_layout.tsx redirects to /(tabs)/home; 'dismiss'/'cancel' means the
   * student closed the browser, so nothing is reported.
   */
  const handleLogin = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        await completeLogin(result.params.code, request?.codeVerifier ?? '', SIGEF_REDIRECT_URI);
      } else if (result.type === 'error') {
        setError('No se pudo completar el inicio de sesión. Intenta de nuevo.');
      }
    } catch {
      setError('No se pudo conectar con SIGEF. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.navy }}>
      <StatusBar style="light" />
      <View className="flex-1 px-8" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
        <View className="flex-1 items-center justify-center">
          <EmblemWithRings />
          <Text className="mt-2 text-overline font-bold uppercase tracking-[3px] text-celeste">Funval Internacional</Text>
          <Text className="mt-2 text-title font-extrabold text-white">Brújula de Vida</Text>
          <Text className="mt-2 text-center text-body" style={{ color: COLORS.onNavyMuted }}>
            Tu plan a 5 años y tus horas de servicio, en un solo lugar.
          </Text>
        </View>

        {error ? <Text className="mb-3 text-center text-label text-red-300">{error}</Text> : null}
        <Pressable
          className="h-14 items-center justify-center rounded-2xl bg-white active:opacity-80"
          onPress={handleLogin}
          disabled={submitting || !request}
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.navy} />
          ) : (
            <Text className="text-body font-bold text-navy">Iniciar sesión</Text>
          )}
        </Pressable>
        <Text className="mt-5 text-center text-caption" style={{ color: '#4F6587' }}>
          © {new Date().getFullYear()} Funval Internacional
        </Text>
      </View>
    </View>
  );
}
