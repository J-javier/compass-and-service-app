import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { AlertTriangle, Check, Compass, HelpCircle, Lock, PenLine, Printer } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StatusPill from '@/components/StatusPill';
import VisionGuideModal from '@/components/VisionGuideModal';
import ProgressRing from '@/components/ui/ProgressRing';
import SectionLabel from '@/components/ui/SectionLabel';
import { getAreaStyle } from '@/constants/areas';
import { CARD_SHADOW, COLORS } from '@/constants/theme';
import { useCompass } from '@/hooks/useCompass';
import { getApiErrorMessage } from '@/lib/apiError';
import { PLAN_STATUS, PLAN_STATUS_META, categoryProgress } from '@/lib/compass';

/** Brújula de Vida tab (option A): plan status and progress, vision and the five areas. */
export default function Brujula() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plan, progress, categories, goals, loading, error, canExport, refetch, exportCompass } = useCompass({ autoload: false });
  const [showVisionGuide, setShowVisionGuide] = useState(false);
  const [exporting, setExporting] = useState(false);

  /** Goals and vision are edited on other screens — reloads when coming back. */
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  /** Downloads the approved plan's PDF and opens it (only enabled once the plan is approved). */
  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCompass();
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e, 'No se pudo imprimir la Brújula. Intenta de nuevo.'));
    } finally {
      setExporting(false);
    }
  };

  /** Loading, error, empty (no plan yet) or full plan view. */
  const renderBody = () => {
    if (loading && !plan && categories.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.navy} />
        </View>
      );
    }
    if (error && !plan) {
      return (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-body text-red-600">{error}</Text>
          <Pressable className="rounded-xl bg-navy px-5 py-3 active:opacity-80" onPress={refetch}>
            <Text className="text-body font-semibold text-white">Reintentar</Text>
          </Pressable>
        </View>
      );
    }
    if (!plan) {
      return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text className="mb-5 text-title font-bold text-navy">Mi Brújula</Text>
          <View className="items-center rounded-3xl bg-white p-6" style={CARD_SHADOW}>
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Compass color={COLORS.navy} size={30} />
            </View>
            <Text className="mb-2 text-center text-heading font-bold text-ink">Crea tu Brújula de Vida</Text>
            <Text className="mb-6 text-center text-label text-muted">
              Define tu visión personal y el año de inicio de tu plan a 5 años para empezar a cargar tus metas.
            </Text>
            <Pressable className="rounded-2xl bg-navy px-6 py-4 active:opacity-80" onPress={() => router.push('/configurar-plan')}>
              <Text className="text-body font-bold text-white">Configurar mi plan</Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }

    const statusMeta = PLAN_STATUS_META[plan.status.id] ?? PLAN_STATUS_META[1];
    const totalSlots = progress.total_possible_slots || 55;
    const percent = totalSlots > 0 ? (progress.filled_slots / totalSlots) * 100 : 0;
    const missing = Math.max(totalSlots - progress.filled_slots, 0);
    const hasVision = !!plan.vision?.trim();

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Title + plan status */}
        <View className="mb-5 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-title font-bold text-navy">Mi Brújula</Text>
            <Text className="text-label text-muted">Plan {plan.start_year} – {plan.start_year + 4}</Text>
          </View>
          <View className="mt-1.5">
            <StatusPill label={plan.status.name || statusMeta.label} bgClass={statusMeta.bg} textClass={statusMeta.text} />
          </View>
        </View>

        {plan.status.id === PLAN_STATUS.REJECTED && plan.review_notes ? (
          <View className="mb-4 flex-row items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle color="#DC2626" size={18} style={{ marginTop: 1 }} />
            <View className="flex-1">
              <Text className="mb-1 text-label font-bold text-red-700">Motivo del rechazo</Text>
              <Text className="text-label text-red-600">{plan.review_notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Overall progress — same navy hero as Horas de servicio */}
        <View className="mb-4 flex-row items-center gap-4 rounded-3xl p-5" style={{ backgroundColor: COLORS.navy }}>
          <ProgressRing percent={percent} size={88} strokeWidth={9} color={COLORS.celeste} trackColor="rgba(255,255,255,0.14)">
            <Text className="text-heading font-bold text-white">{Math.round(percent)}%</Text>
          </ProgressRing>
          <View className="flex-1">
            <Text className="text-display font-bold text-white">
              {progress.filled_slots}
              <Text className="text-body font-normal" style={{ color: COLORS.onNavyMuted }}> / {totalSlots} metas</Text>
            </Text>
            <Text className="text-label" style={{ color: COLORS.onNavyMuted }}>
              {missing > 0 ? `Te faltan ${missing} para completar tu plan` : '¡Completaste tu Brújula de Vida!'}
            </Text>
          </View>
        </View>

        {/* Vision */}
        <View className="mb-6 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderLeftWidth: 4, borderLeftColor: '#F59E0B' }]}>
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Text className="text-overline font-bold uppercase tracking-widest text-amber-700">Mi visión</Text>
              <Pressable className="p-1 active:opacity-60" onPress={() => setShowVisionGuide(true)} hitSlop={8} accessibilityLabel="Cómo escribir mi visión">
                <HelpCircle color={COLORS.faint} size={16} />
              </Pressable>
            </View>
            <Pressable
              className="flex-row items-center gap-1 active:opacity-60"
              onPress={() => router.push('/configurar-plan?mode=edit')}
              hitSlop={8}
            >
              <PenLine color={COLORS.brand} size={14} />
              <Text className="text-label font-semibold text-brand">Editar</Text>
            </Pressable>
          </View>
          {hasVision ? (
            <Text className="text-label italic text-ink">&ldquo;{plan.vision}&rdquo;</Text>
          ) : (
            <Text className="text-label text-muted">
              Todavía no definiste tu visión personal. No podrás guardar metas hasta que la escribas.
            </Text>
          )}
        </View>

        {/* Areas */}
        <SectionLabel>Áreas</SectionLabel>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {categories.map((cat) => {
            const style = getAreaStyle(cat.name);
            const Icon = style.icon;
            const { completed, total } = categoryProgress(cat, goals, plan.start_year);
            const done = total > 0 && completed >= total;
            return (
              <Pressable
                key={cat.id}
                className="w-[48.5%] rounded-2xl bg-white p-3.5 active:opacity-70"
                style={CARD_SHADOW}
                onPress={() =>
                  hasVision
                    ? router.push(`/editar-metas?categoryId=${cat.id}`)
                    : Alert.alert('Visión requerida', 'Primero escribe tu visión personal para poder cargar metas.')
                }
              >
                <View className="mb-3 flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: style.iconBg }}>
                    <Icon color={style.iconColor} size={16} />
                  </View>
                  <Text className="flex-1 text-body font-semibold text-ink" numberOfLines={1}>{cat.name}</Text>
                </View>
                <View className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <View className="h-full rounded-full" style={{ width: `${total ? (completed / total) * 100 : 0}%`, backgroundColor: done ? '#16A34A' : style.accentColor }} />
                </View>
                {done ? (
                  <View className="flex-row items-center gap-1">
                    <Check color="#16A34A" size={12} strokeWidth={3} />
                    <Text className="text-caption font-semibold text-green-700">Completo</Text>
                  </View>
                ) : (
                  <Text className="text-caption text-muted">{completed}/{total} metas</Text>
                )}
              </Pressable>
            );
          })}

          {/* Print tile: only actionable once the plan is approved */}
          <Pressable
            className="w-[48.5%] items-center justify-center rounded-2xl p-3.5 active:opacity-70"
            style={canExport ? { backgroundColor: COLORS.navy } : { backgroundColor: '#EEF1F5' }}
            disabled={!canExport || exporting}
            onPress={handleExport}
          >
            {exporting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : canExport ? (
              <Printer color={COLORS.white} size={20} />
            ) : (
              <Lock color={COLORS.faint} size={20} />
            )}
            <Text className="mt-2 text-center text-caption font-semibold" style={{ color: canExport ? COLORS.white : COLORS.muted }}>
              {canExport ? 'Imprimir Brújula' : 'Se habilita cuando tu Brújula sea aprobada'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-paper" style={{ paddingTop: insets.top }}>
      {renderBody()}
      <VisionGuideModal visible={showVisionGuide} onClose={() => setShowVisionGuide(false)} />
    </View>
  );
}
