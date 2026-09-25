import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterChips from '@/components/FilterChips';
import ReportItem from '@/components/ReportItem';
import { useCategories } from '@/hooks/useCategories';
import { useReports } from '@/hooks/useReports';
import { getApiErrorMessage } from '@/lib/apiError';
import { REPORT_STATUS } from '@/lib/serviceReports';
import { ServiceReportStatusId } from '@/types/api';

const STATUS_OPTIONS: { value: ServiceReportStatusId | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: REPORT_STATUS.PENDING, label: 'Pendiente' },
  { value: REPORT_STATUS.APPROVED_FULL, label: 'Aprobado completo' },
  { value: REPORT_STATUS.APPROVED_PARTIAL, label: 'Aprobado parcial' },
  { value: REPORT_STATUS.REJECTED, label: 'Rechazado' },
];

export default function HistorialHS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: reports, progress, loading, error, refetch, openEvidence } = useReports({ autoload: false });
  const { data: categories } = useCategories();
  const [status, setStatus] = useState<ServiceReportStatusId | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  // Reload when coming back from the create/edit screen
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const filtered = useMemo(
    () => (status == null ? reports : reports.filter((r) => r.status.id === status)),
    [reports, status],
  );

  const totalHours = reports.reduce((sum, r) => sum + r.hours_spent, 0);
  const approvedHours = progress.approved_hours ?? 0;
  const pendingHours = reports
    .filter((r) => r.status.id === REPORT_STATUS.PENDING)
    .reduce((sum, r) => sum + r.hours_spent, 0);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

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
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <Pressable
          className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#002d4e" size={24} />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900">Historial de Horas</Text>
        <View className="w-9" />
      </View>

      {loading && reports.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002d4e" />
        </View>
      ) : error && reports.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="text-red-500 text-center">{error}</Text>
          <Pressable className="px-4 py-2 rounded-xl bg-[#002d4e] active:opacity-80" onPress={refetch}>
            <Text className="text-white font-semibold">Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
          ListHeaderComponent={
            <>
              {/* Summary card */}
              <View className="rounded-3xl p-6 mb-5" style={{ backgroundColor: '#002d4e' }}>
                <Text className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                  Total Reportado
                </Text>
                <View className="flex-row items-baseline gap-1 mb-4">
                  <Text className="text-white text-5xl font-bold">{totalHours}</Text>
                  <Text className="text-blue-300 text-xl">horas</Text>
                </View>
                <View className="flex-row gap-3 flex-wrap">
                  <View className="flex-row items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <Text className="text-white text-xs font-medium">{approvedHours} Aprobadas</Text>
                  </View>
                  <View className="flex-row items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <Text className="text-white text-xs font-medium">{pendingHours} Pendientes</Text>
                  </View>
                </View>
              </View>

              <View className="mb-4">
                <FilterChips options={STATUS_OPTIONS} selected={status} onSelect={setStatus} />
              </View>
            </>
          }
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-8">
              {status == null ? 'No tienes reportes aún.' : 'No hay reportes con este estado.'}
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

      {/* FAB */}
      <Pressable
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center active:opacity-80"
        style={{ shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}
        onPress={() => router.push('/reportar-hs')}
      >
        <Plus color="#fff" size={28} />
      </Pressable>
    </View>
  );
}
