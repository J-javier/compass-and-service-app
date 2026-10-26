import { ReactNode, useCallback } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Bell, ChevronRight, Clock, Compass, ExternalLink, HelpCircle, KeyRound, LogOut } from 'lucide-react-native';
import SectionLabel from '@/components/ui/SectionLabel';
import { SIGEF_BASE_URL } from '@/constants/oidc';
import { CARD_SHADOW, COLORS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCompass } from '@/hooks/useCompass';
import { useReports } from '@/hooks/useReports';
import { formatHours } from '@/lib/serviceReports';

const AVATAR = 88;

/** Settings-style row with icon, label and an optional value or trailing element. */
function Row({ icon, label, value, trailing, onPress, disabled, last }: {
  icon: ReactNode;
  label: string;
  value?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      className={`min-h-[52px] flex-row items-center gap-3 px-4 py-3 ${onPress ? 'active:bg-gray-50' : ''} ${last ? '' : 'border-b border-gray-100'}`}
      onPress={onPress}
      disabled={!onPress || disabled}
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      {icon}
      <Text className="flex-1 text-body text-ink">{label}</Text>
      {value ? <Text className="text-body font-semibold text-navy">{value}</Text> : null}
      {trailing}
    </Pressable>
  );
}

/** Titled group of rows inside a single card. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-6">
      <SectionLabel>{title}</SectionLabel>
      <View className="overflow-hidden rounded-2xl bg-white" style={CARD_SHADOW}>{children}</View>
    </View>
  );
}

/** Perfil tab: identity card, progress summary, account and support options, logout. */
export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { progress: hsProgress, loading: hsLoading, refetch: refetchReports } = useReports({ autoload: false });
  const { plan, progress: compassProgress, loading: compassLoading, refetch: refetchCompass } = useCompass({ autoload: false });
  /** Spinner only on first load; focus refetches update values in place. */
  const loading = (hsLoading || compassLoading) && !plan && hsProgress.approved_hours == null;

  useFocusEffect(useCallback(() => {
    refetchReports();
    refetchCompass();
  }, [refetchReports, refetchCompass]));

  const initials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() : '?';
  const approved = formatHours(hsProgress.approved_hours);
  const hoursValue = hsProgress.required_hours != null ? `${approved} / ${formatHours(hsProgress.required_hours)} h` : `${approved} h`;
  const compassValue = plan ? `${compassProgress.filled_slots} / ${compassProgress.total_possible_slots || 55}` : 'Sin plan';

  /** Asks before logging out: getting back in requires going through SIGEF again. */
  const confirmLogout = () =>
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir? Tendrás que volver a iniciar sesión con SIGEF.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);

  return (
    <View className="flex-1 bg-paper" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="mb-5 text-title font-bold text-navy">Perfil</Text>

        {/* Identity */}
        <View
          className="mb-6 items-center rounded-3xl"
          style={{ backgroundColor: COLORS.navy, paddingTop: 28, paddingBottom: 24, paddingHorizontal: 24 }}
        >
          <View className="mb-4 rounded-full p-1" style={{ borderWidth: 2, borderColor: COLORS.celeste }}>
            {user?.photo_url ? (
              <Image source={{ uri: user.photo_url }} style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }} />
            ) : (
              <View
                className="items-center justify-center bg-brand"
                style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }}
              >
                <Text className="text-title font-bold text-white">{initials}</Text>
              </View>
            )}
          </View>
          <Text className="text-center text-title font-bold text-white" numberOfLines={2}>{user?.full_name ?? '—'}</Text>
          <Text className="mt-1 text-center text-body" style={{ color: COLORS.onNavyMuted }} numberOfLines={1}>
            {user?.email ?? '—'}
          </Text>
          {user?.course_name || user?.role ? (
            <View className="mt-4 flex-row flex-wrap justify-center gap-2">
              {user?.course_name ? (
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(107,184,211,0.18)' }}>
                  <Text className="text-label font-semibold text-celeste" numberOfLines={1}>
                    {user.course_name}{user.term ? ` · ${user.term}` : ''}
                  </Text>
                </View>
              ) : null}
              {user?.role ? (
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                  <Text className="text-label font-semibold text-white">{user.role}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <Group title="Mi progreso">
          {loading ? (
            <ActivityIndicator color={COLORS.navy} style={{ marginVertical: 18 }} />
          ) : (
            <>
              <Row icon={<Clock color={COLORS.brand} size={20} />} label="Horas de servicio" value={hoursValue} onPress={() => router.push('/(tabs)/servicio')} />
              <Row icon={<Compass color={COLORS.navy} size={20} />} label="Brújula de Vida" value={compassValue} onPress={() => router.push('/(tabs)/brujula')} last />
            </>
          )}
        </Group>

        <Group title="Cuenta">
          <Row
            icon={<KeyRound color={COLORS.navy} size={20} />}
            label="Cambiar contraseña"
            trailing={<ChevronRight color={COLORS.faint} size={18} />}
            onPress={() => router.push('/cambiar-contrasena')}
          />
          <Row
            icon={<Bell color={COLORS.navy} size={20} />}
            label="Notificaciones"
            trailing={
              <View className="rounded-full bg-gray-100 px-2 py-0.5">
                <Text className="text-overline font-semibold text-muted">Pronto</Text>
              </View>
            }
            disabled
            last
          />
        </Group>

        <Group title="Soporte">
          <Row
            icon={<HelpCircle color={COLORS.navy} size={20} />}
            label="Ayuda (portal SIGEF)"
            trailing={<ExternalLink color={COLORS.faint} size={16} />}
            onPress={() => WebBrowser.openBrowserAsync(`${SIGEF_BASE_URL}/portal`)}
            last
          />
        </Group>

        <Pressable
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white active:opacity-70"
          onPress={confirmLogout}
          accessibilityRole="button"
        >
          <LogOut color="#DC2626" size={20} />
          <Text className="text-body font-semibold text-red-600">Cerrar sesión</Text>
        </Pressable>
        <Text className="mt-4 text-center text-caption text-muted">Versión {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </View>
  );
}
