import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HelpCircle, Lightbulb, Lock } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VisionGuideModal from '@/components/VisionGuideModal';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { COLORS } from '@/constants/theme';
import { VISION_GUIDE } from '@/constants/visionGuide';
import { useCompass } from '@/hooks/useCompass';
import { getApiErrorCode, getApiErrorMessage, getApiFieldErrors } from '@/lib/apiError';
import { planYears } from '@/lib/compass';

const MAX_VISION = 5000;

/**
 * Creates the plan (start year + vision) or, with `?mode=edit`, edits the
 * vision of the existing one. The start year can only change while the plan
 * has no goals (SIGEF locks it afterwards).
 */
export default function ConfigurarPlan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEditing = mode === 'edit';
  const { plan, goals, loading, createPlan, updatePlan } = useCompass({ autoload: isEditing });

  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear);
  const [vision, setVision] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showVisionGuide, setShowVisionGuide] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hydrated, setHydrated] = useState(!isEditing);

  /** Edit mode: starts from the saved plan. */
  useEffect(() => {
    if (!isEditing || hydrated || !plan) return;
    setStartYear(plan.start_year);
    setVision(plan.vision ?? '');
    setHydrated(true);
  }, [isEditing, hydrated, plan]);

  const yearLocked = isEditing && goals.length > 0;
  /** Only this year and the next one; an existing plan's year stays selectable too. */
  const yearOptions = Array.from(new Set([...(isEditing && plan ? [plan.start_year] : []), currentYear, currentYear + 1])).sort();
  const years = planYears(startYear);

  /**
   * Creates the plan or, in edit mode, updates the vision (and the start year
   * while there are no goals). The vision is required here even though the API
   * accepts it empty, because goals can't be saved without one.
   */
  const handleSave = async () => {
    if (!vision.trim()) {
      setErrors({ vision: 'Escribe tu visión personal para poder cargar tus metas.' });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEditing) {
        await updatePlan({
          vision: vision.trim(),
          ...(!yearLocked && plan && startYear !== plan.start_year ? { start_year: startYear } : {}),
        });
        router.back();
      } else {
        await createPlan({ start_year: startYear, vision: vision.trim() });
        router.replace('/(tabs)/brujula');
      }
    } catch (e) {
      const fieldErrors = getApiFieldErrors(e);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else if (getApiErrorCode(e) === 'plan_already_exists') {
        Alert.alert('Plan existente', getApiErrorMessage(e), [{ text: 'OK', onPress: () => router.replace('/(tabs)/brujula') }]);
      } else {
        Alert.alert('Error', getApiErrorMessage(e, isEditing ? 'No se pudo guardar tu visión.' : 'No se pudo crear el plan.'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && !hydrated) {
    return (
      <View className="flex-1 bg-white">
        <ScreenHeader title="Editar mi visión" />
        <View className="flex-1 items-center justify-center">
          {loading ? <ActivityIndicator size="large" color={COLORS.navy} /> : (
            <Text className="text-body text-muted">No se encontró tu plan de Brújula de Vida.</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={isEditing ? 'Editar mi visión' : 'Crear mi Brújula'} />

      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" bottomOffset={24} contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
        {!isEditing ? (
          <Text className="mb-6 text-label text-muted">
            Tu Brújula de Vida es un plan a 5 años. Elige cuándo empieza y escribe tu visión personal: hacia dónde quieres llegar.
          </Text>
        ) : null}

        {/* Start year */}
        <Text className="mb-2 text-label font-semibold text-navy">¿Cuándo empieza tu plan?</Text>
        {yearLocked ? (
          <View className="mb-6 flex-row items-center gap-2 rounded-2xl bg-gray-50 p-4">
            <Lock color={COLORS.faint} size={16} />
            <Text className="flex-1 text-label text-muted">
              Plan {plan!.start_year} – {plan!.start_year + 4}. El año ya no se puede cambiar porque tienes metas cargadas.
            </Text>
          </View>
        ) : (
          <>
            <View className="mb-3 flex-row gap-2">
              {yearOptions.map((y) => {
                const active = y === startYear;
                return (
                  <Pressable
                    key={y}
                    className="rounded-full border px-5 py-2.5 active:opacity-70"
                    style={active ? { backgroundColor: COLORS.navy, borderColor: COLORS.navy } : { borderColor: COLORS.line }}
                    onPress={() => setStartYear(y)}
                  >
                    <Text className="text-body font-semibold" style={{ color: active ? COLORS.white : '#33445A' }}>{y}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="mb-6 rounded-2xl bg-paper p-4">
              <View className="flex-row justify-between">
                <View className="absolute left-2 right-2 top-[5px] h-0.5 bg-gray-300" />
                {years.map((y, i) => {
                  const edge = i === 0 || i === years.length - 1;
                  return (
                    <View key={y} className="items-center">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={edge ? { backgroundColor: i === 0 ? COLORS.navy : COLORS.brand } : { backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.navy }}
                      />
                      <Text className={`mt-1 text-caption ${edge ? 'font-bold text-navy' : 'text-muted'}`}>{edge ? y : `'${String(y).slice(2)}`}</Text>
                    </View>
                  );
                })}
              </View>
              <View className="mt-3 flex-row items-center gap-1.5">
                <Lock color="#B45309" size={12} />
                <Text className="flex-1 text-caption text-amber-700">No podrás cambiar el año cuando cargues tu primera meta.</Text>
              </View>
            </View>
          </>
        )}

        {/* Vision */}
        <View className="mb-2 flex-row items-center gap-1">
          <Text className="text-label font-semibold text-navy">Tu visión personal</Text>
          <Pressable className="p-1 active:opacity-60" onPress={() => setShowVisionGuide(true)} hitSlop={8} accessibilityLabel="Cómo escribir mi visión">
            <HelpCircle color={COLORS.faint} size={16} />
          </Pressable>
        </View>
        <TextInput
          className="rounded-2xl border px-4 py-3 text-body text-ink"
          style={{ borderColor: errors.vision ? '#DC2626' : COLORS.line, minHeight: 140 }}
          value={vision}
          onChangeText={(t) => { setVision(t); if (errors.vision) setErrors({}); }}
          placeholder="¿Quién quieres llegar a ser en cada área de tu vida?"
          placeholderTextColor={COLORS.faint}
          multiline
          maxLength={MAX_VISION}
          textAlignVertical="top"
        />
        <View className="mb-4 mt-1 flex-row justify-between">
          <Text className="flex-1 text-caption text-red-600">{errors.vision ?? errors.start_year ?? ''}</Text>
          <Text className="text-caption text-muted">{vision.length}/{MAX_VISION}</Text>
        </View>

        {/* Guide questions, always at hand */}
        <View className="rounded-2xl bg-amber-50 p-4">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Lightbulb color="#B45309" size={14} />
            <Text className="text-label font-semibold text-amber-700">Preguntas que ayudan</Text>
          </View>
          <Text className="text-label text-amber-900">{VISION_GUIDE.questions[questionIndex]}</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-caption text-amber-700">{questionIndex + 1} de {VISION_GUIDE.questions.length}</Text>
            <Pressable onPress={() => setQuestionIndex((i) => (i + 1) % VISION_GUIDE.questions.length)} hitSlop={8}>
              <Text className="text-caption font-semibold text-amber-700">Siguiente →</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View className="border-t border-gray-100 px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Pressable className="h-14 items-center justify-center rounded-2xl bg-navy active:opacity-80" onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text className="text-body font-bold text-white">{isEditing ? 'Guardar cambios' : 'Crear mi Brújula'}</Text>
          )}
        </Pressable>
      </View>

      <VisionGuideModal visible={showVisionGuide} onClose={() => setShowVisionGuide(false)} />
    </View>
  );
}
