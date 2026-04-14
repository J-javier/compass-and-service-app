import { ScrollView, Text, View, Pressable } from 'react-native';
import {
    CalendarDays,
    ChevronRight,
    Sparkles,
    Users,
    GraduationCap,
    Briefcase,
    Dumbbell,
    Plus,
    Printer,
    PenLine,
    Info,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const USER = {
    name: 'Alfredo Mariscal',
    role: 'Desarrollo Web Frontend',
    initials: 'AM',
    plan: '2025 - 2029',
    vision:
        '"Quiero ser una persona útil y preparada en lo temporal, espiritual, intelectual, física y familiar para poder ayudar a mi familia, comunidad y adaptarme a los cambios de la vida."',
};

const AREAS = [
    {
        id: 1,
        name: 'Espiritual',
        subtitle: 'Proceso de Conversión',
        icon: Sparkles,
        iconColor: '#7C3AED',
        iconBg: '#EDE9FE',
        status: 'COMPLETO',
    },
    {
        id: 2,
        name: 'Familiar',
        subtitle: 'Esposo, Padre e Hijo',
        icon: Users,
        iconColor: '#DC2626',
        iconBg: '#FEE2E2',
        status: 'COMPLETO',
    },
    {
        id: 3,
        name: 'Intelectual',
        subtitle: 'Educación y Cursos',
        icon: GraduationCap,
        iconColor: '#2563EB',
        iconBg: '#DBEAFE',
        status: 'COMPLETO',
    },
    {
        id: 4,
        name: 'Laboral',
        subtitle: 'Define tus metas',
        icon: Briefcase,
        iconColor: '#6B7280',
        iconBg: '#F3F4F6',
        status: 'PENDIENTE',
    },
    {
        id: 5,
        name: 'Salud / Físico',
        subtitle: 'Define tus metas',
        icon: Dumbbell,
        iconColor: '#6B7280',
        iconBg: '#F3F4F6',
        status: 'PENDIENTE',
    },
];

const completedCount = AREAS.filter((a) => a.status === 'COMPLETO').length;
const allComplete = completedCount === AREAS.length;

export default function Brujula() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* User header */}
                <View className="flex-row items-center gap-4 mb-5">
                    <View className="w-16 h-16 rounded-2xl bg-[#002d4e] items-center justify-center">
                        <Text className="text-white text-xl font-bold">{USER.initials}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-900">{USER.name}</Text>
                        <Text className="text-sm text-gray-500 mb-1">{USER.role}</Text>
                        <View className="flex-row items-center gap-1">
                            <CalendarDays color="#3B82F6" size={13} />
                            <Text className="text-xs text-blue-500 font-medium uppercase tracking-wide">
                                Plan {USER.plan}
                            </Text>
                        </View>
                    </View>
                    <View className="w-3 h-3 rounded-full bg-green-500" />
                </View>

                {/* Vision card */}
                <View
                    className="bg-white rounded-2xl p-5 mb-5"
                    style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <Sparkles color="#F59E0B" size={20} />
                            <Text className="text-base font-bold text-gray-900">Mi Visión Personal</Text>
                        </View>
                        <Pressable className="active:opacity-70">
                            <PenLine color="#9CA3AF" size={18} />
                        </Pressable>
                    </View>
                    <Text className="text-gray-600 text-sm leading-6 italic">{USER.vision}</Text>
                </View>

                {/* Áreas de Enfoque header */}
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                        Áreas de Enfoque
                    </Text>
                    <Text className="text-sm font-semibold text-blue-500">
                        {completedCount} DE {AREAS.length}
                    </Text>
                </View>
                {/* Progress bar */}
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-5">
                    <View
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(completedCount / AREAS.length) * 100}%` }}
                    />
                </View>

                {/* Area list */}
                <View className="gap-3 mb-5">
                    {AREAS.map((area) => {
                        const IconComp = area.icon;
                        const isPending = area.status === 'PENDIENTE';
                        return (
                            <Pressable
                                key={area.id}
                                className={`bg-white rounded-2xl p-4 flex-row items-center gap-4 active:opacity-70 ${isPending ? 'border border-dashed border-gray-200' : ''}`}
                                style={
                                    isPending
                                        ? { backgroundColor: '#FAFAFA' }
                                        : { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }
                                }
                                onPress={() => !isPending && router.push('/editar-metas')}
                            >
                                <View
                                    className="w-12 h-12 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: area.iconBg }}
                                >
                                    <IconComp color={area.iconColor} size={22} />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className={`text-base font-semibold ${isPending ? 'text-gray-400' : 'text-gray-800'}`}
                                    >
                                        {area.name}
                                    </Text>
                                    <Text className="text-sm text-gray-400">{area.subtitle}</Text>
                                </View>
                                {isPending ? (
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-sm text-gray-400 font-medium">{area.status}</Text>
                                        <View className="w-7 h-7 rounded-full border-2 border-gray-300 items-center justify-center">
                                            <Plus color="#9CA3AF" size={14} />
                                        </View>
                                    </View>
                                ) : (
                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-green-100 px-2 py-1 rounded-lg">
                                            <Text className="text-green-600 text-xs font-bold">{area.status}</Text>
                                        </View>
                                        <ChevronRight color="#D1D5DB" size={18} />
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>

                {/* Info note */}
                {!allComplete && (
                    <View className="flex-row items-start gap-3 bg-blue-50 rounded-2xl p-4 mb-5">
                        <Info color="#3B82F6" size={16} style={{ marginTop: 2 }} />
                        <Text className="flex-1 text-xs text-blue-600 leading-5">
                            Debes completar las metas de todas las áreas para poder desbloquear la opción de imprimir tu
                            Brújula de Vida.
                        </Text>
                    </View>
                )}

                {/* Print button */}
                <Pressable
                    className={`flex-row items-center justify-center gap-3 p-4 rounded-2xl ${allComplete ? 'bg-[#002d4e] active:opacity-70' : 'bg-gray-200'}`}
                    disabled={!allComplete}
                >
                    <Printer color={allComplete ? '#fff' : '#9CA3AF'} size={20} />
                    <Text className={`font-semibold text-base ${allComplete ? 'text-white' : 'text-gray-400'}`}>
                        Imprimir Brújula
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}
