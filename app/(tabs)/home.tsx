import { useCallback } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import ReportItem from '@/components/ReportItem';
import ProgressRing from '@/components/ui/ProgressRing';
import SectionLabel from '@/components/ui/SectionLabel';
import { CARD_SHADOW, COLORS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCompass } from '@/hooks/useCompass';
import { useReports } from '@/hooks/useReports';
import { PLAN_STATUS, planYears } from '@/lib/compass';
import { REPORT_STATUS, formatHours } from '@/lib/serviceReports';
import { CompassCategoryResponse, CompassGoalResponse, CompassPlanResponse, ServiceReportResponse, ServiceReportsProgress } from '@/types/api';

interface NextStep {
  title: string;
  detail?: string;
  cta?: string;
  href?: Href;
}

/** First (area, year) of the plan window that still has empty goals. */
function firstIncompleteSlot(plan: CompassPlanResponse, categories: CompassCategoryResponse[], goals: CompassGoalResponse[]) {
  for (const year of planYears(plan.start_year)) {
    for (const category of categories) {
      const subIds = new Set(category.subcategories.map((s) => s.id));
      const filled = goals.filter((g) => g.year === year && subIds.has(g.subcategory_id) && g.goal.trim() !== '').length;
      if (filled < category.subcategories.length) return { category, year, filled, total: category.subcategories.length };
    }
  }
  return null;
}

/** The single most useful thing to do now, in priority order. */
function nextStep(
  plan: CompassPlanResponse | null,
  categories: CompassCategoryResponse[],
  goals: CompassGoalResponse[],
  reports: ServiceReportResponse[],
  hours: ServiceReportsProgress,
  categoryName: (id: number) => string | undefined,
): NextStep {
  if (plan?.status.id === PLAN_STATUS.REJECTED) {
    return { title: 'Tu Brújula de Vida fue rechazada', detail: 'Revisa el motivo y ajusta tu plan.', cta: 'Ver mi Brújula', href: '/(tabs)/brujula' };
  }
  const latest = reports[0];
  if (latest?.status.id === REPORT_STATUS.REJECTED) {
    return {
      title: `Tu reporte de ${categoryName(latest.category_id) ?? 'servicio'} fue rechazado`,
      detail: 'Revisa el comentario del revisor.',
      cta: 'Ver historial',
      href: '/historial-hs',
    };
  }
  if (!plan) {
    return { title: 'Crea tu Brújula de Vida', detail: 'Define tu visión y tu plan a 5 años.', cta: 'Empezar', href: '/configurar-plan' };
  }
  if (!plan.vision?.trim()) {
    return { title: 'Escribe tu visión personal', detail: 'La necesitas para cargar tus metas.', cta: 'Escribir', href: '/configurar-plan?mode=edit' };
  }
  const slot = firstIncompleteSlot(plan, categories, goals);
  if (slot) {
    return {
      title: `Completa tus metas de ${slot.year} en ${slot.category.name}`,
      detail: `${slot.filled} de ${slot.total} metas de ese año`,
      cta: 'Continuar',
      href: `/editar-metas?categoryId=${slot.category.id}&year=${slot.year}`,
    };
  }
  if (hours.remaining_hours != null && hours.remaining_hours > 0) {
    return {
      title: `Te faltan ${formatHours(hours.remaining_hours)} horas de servicio`,
      detail: 'Reporta tu próxima actividad.',
      cta: 'Reportar',
      href: '/reportar-hs',
    };
  }
  return { title: '¡Vas al día!', detail: 'Tu Brújula está completa y tus horas al día.' };
}

const PLAN_PILL: Record<number, { label: string; bg: string; text: string }> = {
  [PLAN_STATUS.PENDING]: { label: 'Plan en revisión', bg: '#E3EEFC', text: '#1D5FB8' },
  [PLAN_STATUS.APPROVED]: { label: 'Plan aprobado', bg: '#DCFCE7', text: '#15803D' },
  [PLAN_STATUS.REJECTED]: { label: 'Plan rechazado', bg: '#FEE2E2', text: '#B91C1C' },
};

/** White card with a progress ring, a value and an optional status pill. */
function RingCard({ percent, color, value, unit, label, pill, onPress }: {
  percent: number;
  color: string;
  value: string;
  unit: string;
  label: string;
  pill?: { label: string; bg: string; text: string };
  onPress: () => void;
}) {
  return (
    <Pressable className="flex-1 rounded-2xl bg-white p-4 active:opacity-80" style={CARD_SHADOW} onPress={onPress}>
      <ProgressRing percent={percent} size={56} strokeWidth={7} color={color} trackColor="#E4E9F0" />
      <Text className="mt-3 text-title font-bold text-navy">
        {value}
        <Text className="text-label font-normal text-muted">{unit}</Text>
      </Text>
      <Text className="text-label text-muted" numberOfLines={1}>{label}</Text>
      {pill ? (
        <View className="mt-2 self-start rounded-full px-2 py-0.5" style={{ backgroundColor: pill.bg }}>
          <Text className="text-overline font-semibold" style={{ color: pill.text }}>{pill.label}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Inicio tab (option A): greeting, contextual next step, progress of both
 * modules and recent activity. When the course has no hours goal yet, the
 * hours card shows "0 / 0 h" until SIGEF provides it.
 */
export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: reports, progress: hours, loading: reportsLoading, refetch: refetchReports } = useReports({ autoload: false });
  const { plan, progress: compass, categories, goals, loading: compassLoading, refetch: refetchCompass } = useCompass({ autoload: false });
  const { data: serviceCategories } = useCategories();

  useFocusEffect(useCallback(() => {
    refetchReports();
    refetchCompass();
  }, [refetchReports, refetchCompass]));

  const firstName = user?.first_name || 'Bienvenido';
  const initials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() : '?';
  const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  /** Only the first letter capitalized: "Sábado, 24 de octubre". */
  const today = date.charAt(0).toUpperCase() + date.slice(1);

  const approved = hours.approved_hours ?? 0;
  /** null = the course has no goal configured yet. */
  const required = hours.required_hours;
  const hoursPercent = required != null && required > 0 ? Math.min((approved / required) * 100, 100) : required === 0 ? 100 : 0;
  const totalSlots = compass.total_possible_slots || 55;
  const compassPercent = plan ? (compass.filled_slots / totalSlots) * 100 : 0;
  const pendingHours = reports.filter((r) => r.status.id === REPORT_STATUS.PENDING).reduce((s, r) => s + r.hours_spent, 0);

  /** Service category name for a report's category id. */
  const categoryName = (id: number) => serviceCategories.find((c) => c.id === id)?.name;
  const loaded = !reportsLoading && !compassLoading;
  const step = loaded ? nextStep(plan, categories, goals, reports, hours, categoryName) : null;

  return (
    <View className="flex-1 bg-paper" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        {/* Greeting */}
        <View className="mb-5 flex-row items-center gap-3">
          {user?.photo_url ? (
            <Image source={{ uri: user.photo_url }} className="h-12 w-12 rounded-full" />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-navy">
              <Text className="text-body font-bold text-white">{initials}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-title font-bold text-navy" numberOfLines={1}>Hola, {firstName}</Text>
            <Text className="text-label text-muted">{today}</Text>
          </View>
        </View>

        {/* Next step */}
        {step ? (
          <View className="mb-4 rounded-3xl p-5" style={{ backgroundColor: COLORS.navy }}>
            <Text className="mb-1 text-overline font-bold uppercase tracking-widest text-celeste">Siguiente paso</Text>
            <Text className="text-heading font-bold text-white">{step.title}</Text>
            <View className="mt-3 flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-label" style={{ color: COLORS.onNavyMuted }}>{step.detail}</Text>
              {step.cta && step.href ? (
                <Pressable
                  className="flex-row items-center gap-1.5 rounded-full bg-white px-4 py-2 active:opacity-80"
                  onPress={() => router.push(step.href!)}
                >
                  <Text className="text-label font-bold text-navy">{step.cta}</Text>
                  <ArrowRight color={COLORS.navy} size={14} />
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Progress of both modules */}
        <View className="mb-7 flex-row gap-3">
          <RingCard
            percent={hoursPercent}
            color={COLORS.brand}
            value={formatHours(approved)}
            unit={` / ${formatHours(required ?? 0)} h`}
            label="Horas de servicio"
            pill={pendingHours > 0 ? { label: `${formatHours(pendingHours)} h pendientes`, bg: '#FEF3C7', text: '#B45309' } : undefined}
            onPress={() => router.push('/(tabs)/servicio')}
          />
          <RingCard
            percent={compassPercent}
            color={COLORS.navy}
            value={plan ? String(compass.filled_slots) : '—'}
            unit={plan ? ` / ${totalSlots}` : ''}
            label="Metas de Brújula"
            pill={plan ? PLAN_PILL[plan.status.id] : { label: 'Sin plan', bg: '#EEF1F5', text: COLORS.muted }}
            onPress={() => router.push('/(tabs)/brujula')}
          />
        </View>

        <SectionLabel
          action={
            reports.length > 0 ? (
              <Pressable className="active:opacity-60" onPress={() => router.push('/historial-hs')} hitSlop={8}>
                <Text className="text-label font-semibold text-brand">Ver todo</Text>
              </Pressable>
            ) : undefined
          }
        >
          Actividad reciente
        </SectionLabel>
        {reports.length === 0 && !reportsLoading ? (
          <Text className="text-label text-muted">Todavía no has enviado ningún reporte de horas.</Text>
        ) : (
          <View className="gap-3">
            {reports.slice(0, 3).map((r) => (
              <ReportItem key={r.id} report={r} categoryName={categoryName(r.category_id)} readOnly />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
