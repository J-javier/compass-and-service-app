import { ActivityIndicator, ScrollView, Text, View, Pressable } from 'react-native';
import { ClipboardCheck, History, Sparkles, GraduationCap } from 'lucide-react-native';
import CardAccionRapida from '@/components/CardAccionRapida';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useDashboard, DashboardStats } from '@/hooks/useDashboard';
import { StudentDashboardStats } from '@/types/api';
import { useCompass } from '@/hooks/useCompass';

function isStudentStats(stats: DashboardStats): stats is StudentDashboardStats {
  return 'reports' in stats && 'course_progress' in stats;
}

export default function Servicio() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useDashboard();
  const { goals } = useCompass();

  const studentStats = stats && isStudentStats(stats) ? stats : null;
  const hoursCompleted = studentStats?.reports.total_hours_approved ?? 0;
  const hoursGoal = studentStats?.course_progress?.required_service_hours ?? 0;
  const progress = hoursGoal > 0 ? Math.round((hoursCompleted / hoursGoal) * 100) : 0;

  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?';

  const headerUser = {
    initials,
    name: user?.full_name ?? '—',
    role: user?.role ?? '—',
    plan: '',
  };

  // Count areas that have at least one goal in any year/subcategory
  const areasWithGoals = goals?.categories.filter((cat) =>
    cat.subcategories.some((sub) => sub.goals.length > 0),
  ).length ?? 0;
  const totalAreas = goals?.categories.length ?? 5;

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        <View
          className="bg-white rounded-2xl flex-row items-center gap-4 mb-5"
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
        >
          <Header user={headerUser} />
        </View>

        {/* Hours summary card */}
        <View className="rounded-3xl p-6 mb-6 overflow-hidden" style={{ backgroundColor: '#002d4e' }}>
          <Text className="text-blue-200 text-sm font-medium mb-1">Total Horas de Servicio</Text>
          {statsLoading ? (
            <ActivityIndicator color="#60a5fa" size="large" style={{ marginVertical: 16 }} />
          ) : (
            <>
              <View className="flex-row items-baseline gap-1 mb-4">
                <Text className="text-white text-5xl font-bold">{hoursCompleted}</Text>
                {hoursGoal > 0 && (
                  <Text className="text-blue-300 text-xl">/ {hoursGoal} hs</Text>
                )}
              </View>
              {hoursGoal > 0 && (
                <>
                  <View className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                    <View className="h-full bg-blue-400 rounded-full" style={{ width: `${progress}%` }} />
                  </View>
                  <Text className="text-blue-200 text-xs">{progress}% de la meta completada</Text>
                </>
              )}
            </>
          )}
        </View>

        {/* Acciones Rápidas */}
        <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
          Acciones Rápidas
        </Text>
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

        {/* Mi Brújula de Vida preview */}
        <Text className="text-base font-bold text-gray-800 mb-3">Mi Brújula de Vida</Text>
        <View
          className="bg-white rounded-2xl p-4 flex-row gap-4"
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
        >
          <View className="w-12 h-12 rounded-xl bg-purple-100 items-center justify-center">
            <Sparkles color="#7C3AED" size={22} />
          </View>
          <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center">
            <GraduationCap color="#059669" size={22} />
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-sm text-gray-500">{areasWithGoals} de {totalAreas} áreas con metas</Text>
          </View>
          <Pressable
            className="self-center active:opacity-70"
            onPress={() => router.push('/(tabs)/brujula')}
          >
            <Text className="text-blue-500 font-medium text-sm">Ver todo</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
