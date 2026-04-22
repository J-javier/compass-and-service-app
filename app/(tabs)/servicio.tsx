import { ScrollView, Text, View, Pressable } from 'react-native';
import { ChevronRight, ClipboardCheck, History, Sparkles, GraduationCap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';

const USER = {
    name: 'Alfredo Mariscal',
    role: 'Desarrollo Web Frontend',
    location: 'México',
    initials: 'AM',
    plan: '',
    hoursCompleted: 124,
    hoursGoal: 200,
};


export default function Servicio() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const progress = USER.hoursCompleted / USER.hoursGoal;
    const percent = Math.round(progress * 100);

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
           

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                
                <View
                    className="bg-white rounded-2xl flex-row items-center gap-4 mb-5"
                    style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
                >

                <Header user={USER} />
                </View>

                {/* Hours summary card */}
                <View className="rounded-3xl p-6 mb-6 overflow-hidden" style={{ backgroundColor: '#002d4e' }}>
                    <Text className="text-blue-200 text-sm font-medium mb-1">Total Horas de Servicio</Text>
                    <View className="flex-row items-baseline gap-1 mb-4">
                        <Text className="text-white text-5xl font-bold">{USER.hoursCompleted}</Text>
                        <Text className="text-blue-300 text-xl">/ {USER.hoursGoal} hs</Text>
                    </View>
                    {/* Progress bar */}
                    <View className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                        <View
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${percent}%` }}
                        />
                    </View>
                    <Text className="text-blue-200 text-xs">{percent}% de la meta anual completada</Text>
                </View>

                {/* Acciones Rápidas */}
                <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
                    Acciones Rápidas
                </Text>
                <View className="gap-3 mb-6">
                    <Pressable
                        className="bg-white rounded-2xl p-4 flex-row items-center gap-4 active:opacity-70"
                        style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
                        onPress={() => router.push('/reportar-hs')}
                    >
                        <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center">
                            <ClipboardCheck color="#3B82F6" size={22} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-800">Reportar Horas (HS)</Text>
                            <Text className="text-sm text-gray-400">Registra un nuevo servicio realizado</Text>
                        </View>
                        <ChevronRight color="#D1D5DB" size={20} />
                    </Pressable>

                    <Pressable
                        className="bg-white rounded-2xl p-4 flex-row items-center gap-4 active:opacity-70"
                        style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
                        onPress={() => router.push('/historial-hs')}
                    >
                        <View className="w-12 h-12 rounded-xl bg-purple-50 items-center justify-center">
                            <History color="#8B5CF6" size={22} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-800">Ver Historial (HS)</Text>
                            <Text className="text-sm text-gray-400">Ver estado y detalles de reportes previos</Text>
                        </View>
                        <ChevronRight color="#D1D5DB" size={20} />
                    </Pressable>
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
                        <Text className="text-sm text-gray-500">3 de 5 áreas completadas</Text>
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
