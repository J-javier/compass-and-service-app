import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterChips from '@/components/FilterChips';
import HoursSummaryCard from '@/components/HoursSummaryCard';
import ReportItem from '@/components/ReportItem';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { COLORS } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useReports } from '@/hooks/useReports';
import { getApiErrorMessage } from '@/lib/apiError';
import { REPORT_STATUS, REPORT_STATUS_META } from '@/lib/serviceReports';
import { ServiceReportStatusId } from '@/types/api';

/** Status filters, with the same labels as the SIGEF web portal. */
const STATUS_FILTERS: { value: ServiceReportStatusId | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: REPORT_STATUS.PENDING, label: 'Pendiente' },
  { value: REPORT_STATUS.APPROVED_FULL, label: 'Aprobado (completo)' },
  { value: REPORT_STATUS.APPROVED_PARTIAL, label: 'Aprobado (parcial)' },
  { value: REPORT_STATUS.REJECTED, label: 'Rechazado' },
];

/** Full report history: hours summary, status filters and each report's actions. */
export default function HistorialHS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: reports, progress, loading, error, refetch, openEvidence } = useReports({ autoload: false });
  const { data: categories } = useCategories();
  const [status, setStatus] = useState<ServiceReportStatusId | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  /** Reloads when coming back from the create/edit screen. */
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const filtered = useMemo(
    () => (status == null ? reports : reports.filter((r) => r.status.id === status)),
    [reports, status],
  );

  /** Total hours reported in a given status (the API only sums approved/rejected). */
  const sumHours = (statusId: number) =>
    reports.filter((r) => r.status.id === statusId).reduce((sum, r) => sum + r.hours_spent, 0);
  const filterOptions = STATUS_FILTERS.map((f) => ({
    ...f,
    count: f.value == null ? reports.length : reports.filter((r) => r.status.id === f.value).length,
    color: f.value == null ? undefined : REPORT_STATUS_META[f.value].color,
  }));

  /** Service category name for a report's category id. */
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  /** Downloads a report's evidence PDF and opens it with the system viewer. */
  const handleViewEvidence = async (id: number) => {
    setOpeningId(id);
    try {
      await openEvidence(id);
    } catch (e) {
      Alert.alert('Error', getApiErrorMessage(e, 'No se pudo abrir la evidencia'));
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <View className="flex-1 bg-paper">
      <ScreenHeader title="Historial de horas" />

      {loading && reports.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.navy} />
        </View>
      ) : error && reports.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-body text-red-600">{error}</Text>
          <Pressable className="rounded-xl bg-navy px-5 py-3 active:opacity-80" onPress={refetch}>
            <Text className="text-body font-semibold text-white">Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
          ListHeaderComponent={
            <>
              <HoursSummaryCard
                progress={progress}
                pendingHours={sumHours(REPORT_STATUS.PENDING)}
                rejectedHours={sumHours(REPORT_STATUS.REJECTED)}
              />
              <View className="mb-4">
                <FilterChips options={filterOptions} selected={status} onSelect={setStatus} />
              </View>
            </>
          }
          ListEmptyComponent={
            <Text className="mt-8 text-center text-label text-muted">
              {status == null ? 'Todavía no has enviado ningún reporte.' : 'No hay reportes con este estado.'}
            </Text>
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <ReportItem
              report={item}
              categoryName={categoryName(item.category_id)}
              openingEvidence={openingId === item.id}
              onViewEvidence={item.has_evidence === false ? undefined : () => handleViewEvidence(item.id)}
              onEdit={() => router.push(`/reportar-hs?id=${item.id}`)}
            />
          )}
        />
      )}

      <Pressable
        className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-brand active:opacity-80"
        style={{ bottom: insets.bottom + 24, shadowColor: COLORS.brand, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}
        onPress={() => router.push('/reportar-hs')}
        accessibilityRole="button"
        accessibilityLabel="Reportar horas"
      >
        <Plus color={COLORS.white} size={28} />
      </Pressable>
    </View>
  );
}
