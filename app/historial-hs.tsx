import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { ChevronLeft, SlidersHorizontal, CircleCheck, Clock, XCircle, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReports } from '@/hooks/useReports';
import { ReportResponse, ReportStatus } from '@/types/api';

function statusLabel(status: ReportStatus): string {
  switch (status) {
    case 'APPROVED_FULL':
    case 'APPROVED_PARTIAL':
      return 'APROBADA';
    case 'PENDING':
      return 'PENDIENTE';
    case 'REJECTED':
      return 'RECHAZADA';
  }
}

function ActivityItem({ item }: { item: ReportResponse }) {
  const isApproved = item.status === 'APPROVED_FULL' || item.status === 'APPROVED_PARTIAL';
  const isPending = item.status === 'PENDING';
  const isRejected = item.status === 'REJECTED';

  const iconBg = isApproved ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-red-100';
  const badgeBg = isApproved ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-red-100';
  const badgeText = isApproved ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-red-600';
  const hoursColor = isApproved ? 'text-green-500' : isPending ? 'text-yellow-500' : 'text-red-400';

  const date = new Date(item.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayHours = item.approved_hours != null ? item.approved_hours : item.hours_spent;

  return (
    <View
      className="bg-white rounded-2xl p-4 flex-row items-center gap-4"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
    >
      <View className={`w-11 h-11 rounded-full items-center justify-center ${iconBg}`}>
        {isApproved ? (
          <CircleCheck color="#16A34A" size={22} />
        ) : isPending ? (
          <Clock color="#D97706" size={22} />
        ) : (
          <XCircle color="#DC2626" size={22} />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
          {item.category?.name ?? item.description.substring(0, 40)}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">{date}</Text>
      </View>

      <View className="items-end gap-1">
        <Text className={`text-sm font-bold ${hoursColor}`}>+{displayHours}h</Text>
        <View className={`px-2 py-0.5 rounded-full ${badgeBg}`}>
          <Text className={`text-xs font-semibold ${badgeText}`}>{statusLabel(item.status)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HistorialHS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: reports, loading, error } = useReports();

  const totalHours = reports.reduce((sum, r) => sum + r.hours_spent, 0);
  const approvedHours = reports
    .filter((r) => r.status === 'APPROVED_FULL' || r.status === 'APPROVED_PARTIAL')
    .reduce((sum, r) => sum + (r.approved_hours ?? r.hours_spent), 0);
  const pendingHours = reports
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.hours_spent, 0);

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
        <Pressable className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100">
          <SlidersHorizontal color="#374151" size={20} />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002d4e" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Summary card */}
              <View className="rounded-3xl p-6 mb-6" style={{ backgroundColor: '#002d4e' }}>
                <Text className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                  Total Acumulado
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
                    <View className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <Text className="text-white text-xs font-medium">{pendingHours} Pendientes</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                  Actividad Reciente
                </Text>
                <Pressable className="active:opacity-70">
                  <Text className="text-blue-500 text-sm font-medium">Ver todo</Text>
                </Pressable>
              </View>
            </>
          }
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-8">No tienes reportes aún.</Text>
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <ActivityItem item={item} />}
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
