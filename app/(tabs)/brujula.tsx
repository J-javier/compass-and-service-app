import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AlertTriangle, Compass, Info, PenLine, Printer, Sparkles } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardAreasBrujula from '@/components/CardAreasBrujula';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';
import StatusPill from '@/components/StatusPill';
import VisionGuideModal from '@/components/VisionGuideModal';
import { getAreaStyle } from '@/constants/areas';
import { useAuth } from '@/context/AuthContext';
import { useCompass } from '@/hooks/useCompass';
import { getApiErrorMessage } from '@/lib/apiError';
import { PLAN_STATUS, PLAN_STATUS_META, categoryProgress } from '@/lib/compass';

const MAX_VISION = 5000;

export default function Brujula() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { plan, progress, categories, goals, loading, error, canExport, refetch, updatePlan, exportCompass } = useCompass({ autoload: false });

  // Goals are edited on another screen — reload when coming back
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const [isEditingVision, setIsEditingVision] = useState(false);
  const [visionDraft, setVisionDraft] = useState('');
  const [startYearDraft, setStartYearDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [showVisionGuide, setShowVisionGuide] = useState(false);
  const [exporting, setExporting] = useState(false);

  const hasGoals = goals.length > 0;

  useEffect(() => {
    if (!isEditingVision) {
      setVisionDraft(plan?.vision ?? '');
      setStartYearDraft(plan ? String(plan.start_year) : '');
    }
  }, [plan, isEditingVision]);

  const handleSaveVision = async () => {
    if (!plan) return;
    const trimmed = visionDraft.trim();
    if (!trimmed) {
      Alert.alert('Error', 'La visión no puede quedar vacía: sin visión no se pueden cargar metas.');
      return;
    }
    const payload: { vision: string; start_year?: number } = { vision: trimmed };
    // start_year is locked once there is at least one goal (backend 422)
    if (!hasGoals) {
      const year = parseInt(startYearDraft, 10);
      if (isNaN(year) || year < 2000 || year > 2100) {
        Alert.alert('Error', 'Ingresa un año de inicio válido (2000 - 2100)');
        return;
      }
      if (year !== plan.start_year) payload.start_year = year;
    }
    setSaving(true);
    try {
      await updatePlan(payload);
      setIsEditingVision(false);
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e, 'No se pudo guardar la visión. Intenta de nuevo.'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCompass();
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e, 'No se pudo exportar la brújula. Intenta de nuevo.'));
    } finally {
      setExporting(false);
    }
  };

  const initials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() : '?';
  const headerUser = {
    initials,
    name: user?.full_name ?? '—',
    role: user?.role ?? '—',
    plan: plan ? `${plan.start_year} - ${plan.start_year + 4}` : '',
  };

  const statusMeta = plan ? PLAN_STATUS_META[plan.status.id] ?? PLAN_STATUS_META[1] : null;
  const totalSlots = progress.total_possible_slots || 55;
  const percent = totalSlots > 0 ? (progress.filled_slots / totalSlots) * 100 : 0;

  const renderBody = () => {
    if (loading && !plan && categories.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002d4e" />
        </View>
      );
    }
    if (error && !plan) {
      return (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="text-red-500 text-center">{error}</Text>
          <Pressable className="px-4 py-2 rounded-xl bg-[#002d4e] active:opacity-80" onPress={refetch}>
            <Text className="text-white font-semibold">Reintentar</Text>
          </Pressable>
        </View>
      );
    }
    if (!plan) {
      return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="bg-white rounded-3xl p-6 items-center" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
            <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center mb-4">
              <Compass color="#002d4e" size={30} />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2 text-center">Crea tu Brújula de Vida</Text>
            <Text className="text-sm text-gray-500 text-center leading-6 mb-6">
              Define tu visión personal y el año de inicio de tu plan a 5 años para empezar a cargar tus metas.
            </Text>
            <Pressable className="bg-[#002d4e] rounded-2xl px-6 py-4 active:opacity-80" onPress={() => router.push('/configurar-plan')}>
              <Text className="text-white font-bold">Configurar mi plan</Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Rejection banner */}
        {plan.status.id === PLAN_STATUS.REJECTED && plan.review_notes ? (
          <View className="flex-row items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <AlertTriangle color="#DC2626" size={18} style={{ marginTop: 1 }} />
            <View className="flex-1">
              <Text className="text-sm font-bold text-red-700 mb-1">Tu plan fue rechazado</Text>
              <Text className="text-xs text-red-600 leading-5">{plan.review_notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Vision */}
        <View className="bg-white rounded-2xl p-5 mb-5" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2 flex-1">
              <Sparkles color="#F59E0B" size={20} />
              <Text className="text-base font-bold text-gray-900">Mi Visión Personal</Text>
              <Pressable className="p-1 active:opacity-70" onPress={() => setShowVisionGuide(true)} hitSlop={8}>
                <Info color="#9CA3AF" size={16} />
              </Pressable>
              {statusMeta ? (
                <StatusPill label={plan.status.name || statusMeta.label} bgClass={statusMeta.bg} textClass={statusMeta.text} />
              ) : null}
            </View>
            {!isEditingVision ? (
              <Pressable className="active:opacity-70 p-1" onPress={() => setIsEditingVision(true)}>
                <PenLine color="#9CA3AF" size={18} />
              </Pressable>
            ) : null}
          </View>
          <Text className="text-xs text-gray-400 mb-3">
            Plan {plan.start_year} - {plan.start_year + 4}
          </Text>

          {isEditingVision && !hasGoals ? (
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-xs text-gray-500">Año de inicio:</Text>
              <TextInput
                className="border border-gray-200 rounded-lg px-3 py-1 text-sm text-gray-800"
                value={startYearDraft}
                onChangeText={(t) => setStartYearDraft(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          ) : null}

          <TextInput
            className={`text-sm leading-6 ${isEditingVision ? 'text-gray-800 border border-gray-200 rounded-xl p-3' : 'text-gray-600 italic'}`}
            value={isEditingVision ? visionDraft : plan.vision ?? ''}
            onChangeText={setVisionDraft}
            editable={isEditingVision}
            multiline
            maxLength={MAX_VISION}
            textAlignVertical="top"
            placeholder="Escribe tu visión personal..."
            placeholderTextColor="#9CA3AF"
          />

          {isEditingVision ? (
            <View className="flex-row justify-end gap-2 mt-3">
              <Pressable
                className="px-4 py-2 rounded-lg bg-gray-100 active:opacity-70"
                onPress={() => setIsEditingVision(false)}
                disabled={saving}
              >
                <Text className="text-xs font-semibold text-gray-600">Cancelar</Text>
              </Pressable>
              <Pressable className="px-4 py-2 rounded-lg bg-blue-500 active:opacity-70" onPress={handleSaveVision} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-xs font-semibold text-white">Guardar</Text>}
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Categories */}
        <View className="gap-3 mb-5">
          {categories.map((cat) => {
            const style = getAreaStyle(cat.name);
            const { completed, total } = categoryProgress(cat, goals, plan.start_year);
            return (
              <CardAreasBrujula
                key={cat.id}
                area={{
                  name: cat.name,
                  subtitle: cat.subcategories.map((s) => s.name).join(', '),
                  icon: style.icon,
                  iconColor: style.iconColor,
                  iconBg: style.iconBg,
                  filledCount: completed,
                  totalCount: total,
                }}
                onPress={() =>
                  plan.vision?.trim()
                    ? router.push(`/editar-metas?categoryId=${cat.id}`)
                    : Alert.alert('Visión requerida', 'Primero guarda tu visión personal para poder cargar metas.')
                }
              />
            );
          })}
        </View>

        {/* Progress */}
        <View className="bg-white rounded-2xl p-5 mb-5" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          <View className="flex-row items-baseline justify-between mb-3">
            <Text className="text-base font-bold text-gray-900">Progreso</Text>
            <Text className="text-sm font-semibold text-[#002d4e]">
              {progress.filled_slots}/{totalSlots} metas
            </Text>
          </View>
          <ProgressBar percent={percent} fillClass="bg-[#002d4e]" />
        </View>

        {!canExport && (
          <View className="flex-row items-start gap-3 bg-blue-50 rounded-2xl p-4 mb-5">
            <Info color="#3B82F6" size={16} style={{ marginTop: 2 }} />
            <Text className="flex-1 text-xs text-blue-600 leading-5">
              Podrás exportar tu Brújula de Vida en PDF cuando tu plan sea aprobado.
            </Text>
          </View>
        )}

        <Pressable
          className={`flex-row items-center justify-center gap-3 p-4 rounded-2xl ${canExport && !exporting ? 'bg-[#002d4e] active:opacity-70' : 'bg-gray-200'}`}
          disabled={!canExport || exporting}
          onPress={handleExport}
        >
          {exporting ? <ActivityIndicator color="#fff" size="small" /> : <Printer color={canExport ? '#fff' : '#9CA3AF'} size={20} />}
          <Text className={`font-semibold text-base ${canExport && !exporting ? 'text-white' : 'text-gray-400'}`}>
            {exporting ? 'Exportando...' : 'Exportar Brújula'}
          </Text>
        </Pressable>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <Header user={headerUser} />
      {renderBody()}
      <VisionGuideModal visible={showVisionGuide} onClose={() => setShowVisionGuide(false)} />
    </View>
  );
}
