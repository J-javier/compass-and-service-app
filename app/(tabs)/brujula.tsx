import React, { useState } from 'react'
import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { ChevronRight, Sparkles, Users, GraduationCap, Briefcase, Dumbbell, Plus, Printer, PenLine, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';


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

    const [isEditingVision, setIsEditingVision] = useState<boolean>(false);
    const [vision, setVision] = useState<string>(USER.vision);
    const [visionDraft, setVisionDraft] = useState<string>(USER.vision);

    const handleStartEditVision = () => {
        setVisionDraft(vision);
        setIsEditingVision(true);
    };

    const handleCancelEditVision = () => {
        setVisionDraft(vision);
        setIsEditingVision(false);
    };

    const handleSaveVision = () => {
        setVision(visionDraft.trim() || vision);
        setIsEditingVision(false);
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            {/* User header */}
            <Header user={USER} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

                <View className="bg-white rounded-2xl p-5 mb-5" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>

                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <Sparkles color="#F59E0B" size={20} />
                            <Text className="text-base font-bold text-gray-900">Mi Visión Personal</Text>
                        </View>

                        {!isEditingVision ? (
                            <Pressable className="active:opacity-70" onPress={handleStartEditVision}>
                                <PenLine color="#9CA3AF" size={18} />
                            </Pressable>
                        ) : (
                            <View className="flex-row items-center gap-2">
                                <Pressable
                                    className="px-3 py-1.5 rounded-lg bg-gray-100 active:opacity-70"
                                    onPress={handleCancelEditVision}
                                >
                                    <Text className="text-xs font-semibold text-gray-600">Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    className="px-3 py-1.5 rounded-lg bg-blue-500 active:opacity-70"
                                    onPress={handleSaveVision}
                                >
                                    <Text className="text-xs font-semibold text-white">Guardar</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <TextInput
                        className={`text-sm leading-6 ${isEditingVision ? 'text-gray-800' : 'text-gray-600 italic'}`}
                        value={isEditingVision ? visionDraft : vision}
                        onChangeText={setVisionDraft}
                        editable={isEditingVision}
                        multiline
                        textAlignVertical="top"
                        placeholder="Escribe tu visión personal..."
                        placeholderTextColor="#9CA3AF"
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
