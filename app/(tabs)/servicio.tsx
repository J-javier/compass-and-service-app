import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { ClipboardCheck, History } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardAccionRapida from '@/components/CardAccionRapida';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';
import ReportItem from '@/components/ReportItem';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useReports } from '@/hooks/useReports';
import { REPORT_STATUS } from '@/lib/serviceReports';

function Pill({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
      <View className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
      <Text className="text-white text-xs font-medium">{label}</Text>
    </View>
  );
}

export default function Servicio() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: reports, progress, loading, error, refetch } = useReports({ autoload: false });
  const { data: categories } = useCategories();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const approved = progress.approved_hours ?? 0;
  const required = progress.required_hours; // null = no goal configured (≠ 0)
  const remaining = progress.remaining_hours ?? (required != null ? Math.max(required - approved, 0) : null);
  const percent = required != null && required > 0 ? Math.min((approved / required) * 100, 100) : required === 0 ? 100 : 0;

  const pendingHours = reports
    .filter((r) => r.status.id === REPORT_STATUS.PENDING)
    .reduce((sum, r) => sum + r.hours_spent, 0);
  const rejectedHours = reports
    .filter((r) => r.status.id === REPORT_STATUS.REJECTED)
    .reduce((sum, r) => sum + r.hours_spent, 0);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  const initials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() : '?';
  const headerUser = {
    initials,
    name: user?.full_name ?? '—',
    role: user?.role ?? '—',
    plan: '',
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View
          className="bg-white rounded-2xl flex-row items-center gap-4 mb-5"
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
        >
          <Header user={headerUser} />
        </View>

        {/* Progress card */}
        <View className="rounded-3xl p-6 mb-6 overflow-hidden" style={{ backgroundColor: '#002d4e' }}>
          <Text className="text-blue-200 text-sm font-medium mb-1">Horas de Servicio</Text>
          {loading && reports.length === 0 ? (
            <ActivityIndicator color="#60a5fa" size="large" style={{ marginVertical: 16 }} />
          ) : error ? (
            <Text className="text-red-300 text-sm my-3">{error}</Text>
          ) : required != null ? (
            <>
              <View className="flex-row items-baseline gap-1 mb-4">
                <Text className="text-white text-5xl font-bold">{approved}</Text>
                <Text className="text-blue-300 text-xl">/ {required} horas</Text>
              </View>
              <ProgressBar percent={percent} trackClass="bg-white/20" fillClass="bg-blue-400" />
              <Text className="text-blue-200 text-xs mt-2 mb-4">
                {Math.round(percent)}% completado · {remaining ?? 0} horas restantes
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                <Pill dotClass="bg-green-400" label={`${approved} aprobadas`} />
                <Pill dotClass="bg-amber-400" label={`${pendingHours} pendientes`} />
                <Pill dotClass="bg-red-400" label={`${rejectedHours} rechazadas`} />
                <Pill dotClass="bg-sky-400" label={`${remaining ?? 0} restantes`} />
              </View>
            </>
          ) : (
            <>
              <Text className="text-white text-lg font-semibold mt-1">Total de horas:</Text>
              <View className="flex-row items-baseline gap-1 mb-2">
                <Text className="text-white text-5xl font-bold">{approved}</Text>
                <Text className="text-blue-300 text-xl">horas aprobadas</Text>
              </View>
              <Text className="text-blue-200 text-xs mb-4">
                Tu curso todavía no tiene una meta de horas configurada.
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                <Pill dotClass="bg-green-400" label={`${approved} aprobadas`} />
                <Pill dotClass="bg-amber-400" label={`${pendingHours} pendientes`} />
                <Pill dotClass="bg-red-400" label={`${rejectedHours} rechazadas`} />
              </View>
            </>
          )}
        </View>

        {/* Shortcuts */}
        <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Acciones Rápidas</Text>
        <View className="gap-3 mb-6">
          <CardAccionRapida
            icon={<ClipboardCheck color="#3B82F6" size={22} />}
            iconBgClass="bg-blue-50"
            title="Reportar Horas (HS)"
            subtitle="Registra un nuevo servicio realizado"
            href="/reportar-hs"
          />
          <CardAccionRapida
            icon={<History color="#8B5CF6" size={22} />}
            iconBgClass="bg-purple-50"
            title="Ver Historial (HS)"
            subtitle="Ver estado y detalles de reportes previos"
            href="/historial-hs"
          />
        </View>

        {/* Latest 5 reports (read-only) */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Reportes recientes</Text>
          {reports.length > 0 && (
            <Pressable className="active:opacity-70" onPress={() => router.push('/historial-hs')}>
              <Text className="text-blue-500 text-sm font-medium">Ver todo</Text>
            </Pressable>
          )}
        </View>
        {reports.length === 0 && !loading ? (
          <Text className="text-center text-gray-400 mt-2">Todavía no enviaste reportes.</Text>
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
