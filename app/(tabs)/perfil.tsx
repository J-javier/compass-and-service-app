import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    CalendarDays,
    ChevronRight,
    Bell,
    Lock,
    HelpCircle,
    LogOut,
    CircleUserRound,
} from 'lucide-react-native';

const USER = {
    name: 'Alfredo Mariscal',
    role: 'Desarrollo Web Frontend',
    location: 'México',
    initials: 'AM',
    plan: '2025 - 2029',
    email: 'alfredo@funval.org',
};

const MENU_ITEMS = [
    { id: 1, label: 'Editar Perfil', icon: CircleUserRound, color: '#3B82F6' },
    { id: 2, label: 'Notificaciones', icon: Bell, color: '#8B5CF6' },
    { id: 3, label: 'Seguridad', icon: Lock, color: '#059669' },
    { id: 4, label: 'Ayuda y Soporte', icon: HelpCircle, color: '#F59E0B' },
];

export default function Perfil() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Header label */}
                <Text className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</Text>

                {/* Profile card */}
                <View
                    className="bg-white rounded-3xl p-6 items-center mb-6"
                    style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 }}
                >
                    <View className="w-20 h-20 rounded-2xl bg-[#002d4e] items-center justify-center mb-3">
                        <Text className="text-white text-2xl font-bold">{USER.initials}</Text>
                    </View>
                    <View className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-500" />

                    <Text className="text-xl font-bold text-gray-900">{USER.name}</Text>
                    <Text className="text-sm text-gray-500 mb-2">{USER.role}</Text>
                    <Text className="text-xs text-gray-400 mb-3">{USER.email}</Text>

                    <View className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                        <CalendarDays color="#3B82F6" size={13} />
                        <Text className="text-xs text-blue-500 font-semibold uppercase tracking-wide">
                            Plan {USER.plan}
                        </Text>
                    </View>
                </View>

                {/* Stats row */}
                <View className="flex-row gap-3 mb-6">
                    <View
                        className="flex-1 bg-white rounded-2xl p-4 items-center"
                        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                    >
                        <Text className="text-2xl font-bold text-[#002d4e]">124</Text>
                        <Text className="text-xs text-gray-400 mt-1 text-center">Horas Servicio</Text>
                    </View>
                    <View
                        className="flex-1 bg-white rounded-2xl p-4 items-center"
                        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                    >
                        <Text className="text-2xl font-bold text-green-500">3/5</Text>
                        <Text className="text-xs text-gray-400 mt-1 text-center">Áreas Completadas</Text>
                    </View>
                    <View
                        className="flex-1 bg-white rounded-2xl p-4 items-center"
                        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                    >
                        <Text className="text-2xl font-bold text-blue-500">62%</Text>
                        <Text className="text-xs text-gray-400 mt-1 text-center">Meta Anual</Text>
                    </View>
                </View>

                {/* Menu items */}
                <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Configuración</Text>
                <View
                    className="bg-white rounded-2xl overflow-hidden mb-6"
                    style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                >
                    {MENU_ITEMS.map((item, index) => {
                        const IconComp = item.icon;
                        return (
                            <Pressable
                                key={item.id}
                                className={`flex-row items-center gap-4 px-4 py-4 active:bg-gray-50 ${index < MENU_ITEMS.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <View
                                    className="w-9 h-9 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: `${item.color}20` }}
                                >
                                    <IconComp color={item.color} size={18} />
                                </View>
                                <Text className="flex-1 text-sm font-medium text-gray-700">{item.label}</Text>
                                <ChevronRight color="#D1D5DB" size={18} />
                            </Pressable>
                        );
                    })}
                </View>

                {/* Logout */}
                <Pressable
                    className="flex-row items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl p-4 active:opacity-70"
                    onPress={() => router.replace('/')}
                >
                    <LogOut color="#EF4444" size={20} />
                    <Text className="text-red-500 font-semibold">Cerrar Sesión</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}
