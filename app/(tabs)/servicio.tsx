import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HoursSummaryCard from '@/components/HoursSummaryCard';
import ReportItem from '@/components/ReportItem';
import SectionLabel from '@/components/ui/SectionLabel';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useReports } from '@/hooks/useReports';
import { REPORT_STATUS } from '@/lib/serviceReports';

/** Horas de servicio tab (option A): hours hero, report CTA and recent reports. */
export default function Servicio() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: reports, progress, loading, error, refetch } = useReports({ autoload: false });
  const { data: categories } = useCategories();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  /** Total hours reported in a given status (the API only sums approved/rejected). */
  const sumHours = (statusId: number) =>
    reports.filter((r) => r.status.id === statusId).reduce((sum, r) => sum + r.hours_spent, 0);
  /** Service category name for a report's category id. */
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;
  const courseName = progress.course_name ?? user?.course_name;

  return (
    <View className="flex-1 bg-paper" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="mb-5">
          <Text className="text-title font-bold text-navy">Horas de servicio</Text>
          {courseName ? (
            <Text className="text-label text-muted">
              {courseName}{user?.term ? ` · ${user.term}` : ''}
            </Text>
          ) : null}
        </View>

        <HoursSummaryCard
          progress={progress}
          pendingHours={sumHours(REPORT_STATUS.PENDING)}
          rejectedHours={sumHours(REPORT_STATUS.REJECTED)}
          loading={loading && reports.length === 0}
          error={error}
        />

        <Pressable
          className="mb-7 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand active:opacity-80"
          onPress={() => router.push('/reportar-hs')}
          accessibilityRole="button"
        >
          <Plus color={COLORS.white} size={20} />
          <Text className="text-body font-bold text-white">Reportar horas</Text>
        </Pressable>

        <SectionLabel
          action={
            reports.length > 0 ? (
              <Pressable className="active:opacity-60" onPress={() => router.push('/historial-hs')} hitSlop={8}>
                <Text className="text-label font-semibold text-brand">Ver historial</Text>
              </Pressable>
            ) : undefined
          }
        >
          Recientes
        </SectionLabel>
        {reports.length === 0 && !loading ? (
          <Text className="mt-2 text-center text-label text-muted">Todavía no has enviado ningún reporte de horas.</Text>
        ) : (
          <View className="gap-3">
            {reports.slice(0, 5).map((r) => (
              <ReportItem key={r.id} report={r} categoryName={categoryName(r.category_id)} readOnly />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
