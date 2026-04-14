import { FlatList, Pressable, Text, View } from 'react-native';
import { ChevronLeft, SlidersHorizontal, CircleCheck, Clock, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ActivityStatus = 'APROBADA' | 'PENDIENTE';

interface Activity {
    id: number;
    name: string;
    date: string;
    hours: number;
    status: ActivityStatus;
}

const ACTIVITIES: Activity[] = [
    { id: 1, name: 'Servicio Comunitario', date: '12 de Octubre, 2023', hours: 4, status: 'APROBADA' },
    { id: 2, name: 'Tutoría Académica', date: '15 de Octubre, 2023', hours: 2, status: 'PENDIENTE' },
    { id: 3, name: 'Apoyo Evento Funval', date: '05 de Octubre, 2023', hours: 6, status: 'APROBADA' },
    { id: 4, name: 'Mantenimiento de Redes', date: '18 de Octubre, 2023', hours: 6, status: 'PENDIENTE' },
    { id: 5, name: 'Donación de Material', date: '01 de Octubre, 2023', hours: 1, status: 'APROBADA' },
];

const totalHours = ACTIVITIES.reduce((sum, a) => sum + a.hours, 0);
const approved = ACTIVITIES.filter((a) => a.status === 'APROBADA').reduce((sum, a) => sum + a.hours, 0);
const pending = ACTIVITIES.filter((a) => a.status === 'PENDIENTE').reduce((sum, a) => sum + a.hours, 0);

function ActivityItem({ item }: { item: Activity }) {
    const isApproved = item.status === 'APROBADA';
    return (
        <View
            className="bg-white rounded-2xl p-4 flex-row items-center gap-4"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
            {/* Status icon */}
            <View
                className={`w-11 h-11 rounded-full items-center justify-center ${isApproved ? 'bg-green-100' : 'bg-yellow-100'}`}
            >
                {isApproved ? (
                    <CircleCheck color="#16A34A" size={22} />
                ) : (
                    <Clock color="#D97706" size={22} />
                )}
            </View>

            {/* Info */}
            <View className="flex-1">
                <Text className="text-sm font-bold text-gray-800">{item.name}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">{item.date}</Text>
            </View>

            {/* Hours + badge */}
            <View className="items-end gap-1">
                <Text className="text-sm font-bold text-green-500">+{item.hours}h</Text>
                <View
                    className={`px-2 py-0.5 rounded-full ${isApproved ? 'bg-green-100' : 'bg-yellow-100'}`}
                >
                    <Text
                        className={`text-xs font-semibold ${isApproved ? 'text-green-600' : 'text-yellow-600'}`}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default function HistorialHS() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

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

            <FlatList
                data={ACTIVITIES}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {/* Summary card */}
                        <View
                            className="rounded-3xl p-6 mb-6"
                            style={{ backgroundColor: '#002d4e' }}
                        >
                            <Text className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                                Total Acumulado
                            </Text>
                            <View className="flex-row items-baseline gap-1 mb-4">
                                <Text className="text-white text-5xl font-bold">{totalHours}</Text>
                                <Text className="text-blue-300 text-xl">horas</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-row items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                                    <View className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    <Text className="text-white text-xs font-medium">{approved} Aprobadas</Text>
                                </View>
                                <View className="flex-row items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                                    <View className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                    <Text className="text-white text-xs font-medium">{pending} Pendientes</Text>
                                </View>
                            </View>
                        </View>

                        {/* Section label */}
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
                ItemSeparatorComponent={() => <View className="h-3" />}
                renderItem={({ item }) => <ActivityItem item={item} />}
            />

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
