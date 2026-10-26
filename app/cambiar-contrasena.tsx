import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { COLORS } from '@/constants/theme';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiError';
import { changePassword } from '@/services/studentAccount';
import { ChangePasswordPayload } from '@/types/api';

const FIELDS: { key: keyof ChangePasswordPayload; label: string; autoComplete: 'current-password' | 'new-password' }[] = [
  { key: 'current_password', label: 'Contraseña actual', autoComplete: 'current-password' },
  { key: 'password', label: 'Nueva contraseña', autoComplete: 'new-password' },
  { key: 'password_confirmation', label: 'Confirmar nueva contraseña', autoComplete: 'new-password' },
];

/** Same flow as the web portal's "Cambiar contraseña" (portal/profile.tsx). */
export default function CambiarContrasena() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<ChangePasswordPayload>({ current_password: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** Field revealed while its eye is held down; released → hidden again. */
  const [revealed, setRevealed] = useState<keyof ChangePasswordPayload | null>(null);
  const [saving, setSaving] = useState(false);

  /** Updates one field and clears its error. */
  const setField = (key: keyof ChangePasswordPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  /**
   * Validates locally, then calls PUT /api/students/me/password. 422 errors are
   * shown per field, and a rejected current password is never kept around.
   */
  const handleSave = async () => {
    const found: Record<string, string> = {};
    if (!form.current_password) found.current_password = 'Ingresa tu contraseña actual.';
    if (!form.password) found.password = 'Ingresa la nueva contraseña.';
    else if (form.password !== form.password_confirmation) found.password_confirmation = 'Las contraseñas no coinciden.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await changePassword(form);
      Alert.alert('Contraseña actualizada', 'Los demás accesos con tu cuenta se cerraron. Esta sesión sigue activa.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const fieldErrors = getApiFieldErrors(e);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setForm((prev) => ({ ...prev, current_password: '' }));
      } else {
        Alert.alert('Error', getApiErrorMessage(e, 'No se pudo cambiar la contraseña.'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Cambiar contraseña" />
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" bottomOffset={24} contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-6 text-label text-muted">
          Al cambiarla, los accesos con tu contraseña anterior en otros dispositivos dejarán de funcionar hasta que vuelvas a iniciar sesión.
        </Text>
        {FIELDS.map(({ key, label, autoComplete }) => (
          <View key={key} className="mb-5">
            <Text className="mb-2 text-label font-semibold text-navy">{label}</Text>
            <View
              className="h-14 flex-row items-center rounded-2xl border"
              style={{ borderColor: errors[key] ? '#DC2626' : COLORS.line, paddingLeft: 16, paddingRight: 6 }}
            >
              <TextInput
                className="flex-1 text-body text-ink"
                value={form[key]}
                onChangeText={(t) => setField(key, t)}
                secureTextEntry={revealed !== key}
                autoComplete={autoComplete}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                className="h-11 w-11 items-center justify-center"
                onPressIn={() => setRevealed(key)}
                onPressOut={() => setRevealed(null)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Mantén presionado para ver ${label.toLowerCase()}`}
              >
                {revealed === key ? <EyeOff color={COLORS.navy} size={20} /> : <Eye color={COLORS.faint} size={20} />}
              </Pressable>
            </View>
            {errors[key] ? <Text className="mt-1.5 text-caption text-red-600">{errors[key]}</Text> : null}
          </View>
        ))}
      </KeyboardAwareScrollView>
      <View className="border-t border-gray-100 px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Pressable className="h-14 items-center justify-center rounded-2xl bg-navy active:opacity-80" onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.white} /> : <Text className="text-body font-bold text-white">Guardar contraseña</Text>}
        </Pressable>
      </View>
    </View>
  );
}
