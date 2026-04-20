import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lightbulb, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AREAS } from '@/constants/areas';

const YEARS = [2025, 2026, 2027, 2028, 2029];

export default function EditarMetas() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { areaId } = useLocalSearchParams<{ areaId: string }>();

    const area = AREAS.find((a) => a.id === Number(areaId)) ?? AREAS[0];
    const IconComp = area.icon;

    const [selectedYear, setSelectedYear] = useState(2025);
    const [values, setValues] = useState<Record<number, Record<number, string>>>(area.initialValues);

    const goals = area.goalsByYear[selectedYear] ?? [];

    const getValue = (goalId: number) => values[selectedYear]?.[goalId] ?? '';

    const setValue = (goalId: number, text: string) => {
        setValues((prev) => ({
            ...prev,
            [selectedYear]: { ...(prev[selectedYear] ?? {}), [goalId]: text },
        }));
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ paddingTop: insets.top }}
        >
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
                <Pressable
                    className="flex-row items-center gap-1 active:opacity-70"
                    onPress={() => router.back()}
                >
                    <ChevronLeft color="#3B82F6" size={20} />
                    <Text className="text-blue-500 font-medium">Volver</Text>
                </Pressable>
                <Text className="flex-1 text-center text-base font-bold text-gray-900">Editar Metas</Text>
                <View style={{ width: 64 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
                {/* Area card */}
                <View
                    className="rounded-2xl p-5 flex-row items-center gap-4 mb-5"
                    style={{ backgroundColor: area.accentColor }}
                >
                    <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                        <IconComp color="#fff" size={24} />
                    </View>
                    <View>
                        <Text className="text-white text-xl font-bold">{area.name}</Text>
                        <Text className="text-sm" style={{ color: area.subtitleColor }}>
                            Planificación Quinquenal 2025 - 2029
                        </Text>
                    </View>
                </View>

                {/* Year selector */}
                <View className="flex-row bg-gray-200 rounded-2xl p-1 mb-6">
                    {YEARS.map((year) => (
                        <Pressable
                            key={year}
                            className={`flex-1 py-2 rounded-xl items-center active:opacity-70 ${selectedYear === year ? 'bg-white' : ''}`}
                            onPress={() => setSelectedYear(year)}
                        >
                            <Text
                                className={`text-sm font-semibold ${selectedYear === year ? 'text-gray-900' : 'text-gray-500'}`}
                            >
                                {year}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Goal cards */}
                <View className="gap-4 mb-5">
                    {goals.map((goal) => {
                        const val = getValue(goal.id);
                        return (
                            <View
                                key={goal.id}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
                            >
                                {/* Goal header */}
                                <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                                    <View className="flex-row items-center gap-2">
                                        <View
                                            className="w-1 h-5 rounded-full"
                                            style={{ backgroundColor: area.accentColor }}
                                        />
                                        <Text className="text-base font-bold text-gray-800">{goal.name}</Text>
                                    </View>
                                    <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                        Meta {selectedYear}
                                    </Text>
                                </View>
                                {/* Text area */}
                                <View className="px-4 pb-3">
                                    <TextInput
                                        className="text-gray-700 text-sm leading-6"
                                        value={val}
                                        onChangeText={(t) => setValue(goal.id, t)}
                                        placeholder={goal.placeholder}
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        maxLength={200}
                                        textAlignVertical="top"
                                        style={{ minHeight: 80 }}
                                    />
                                    <Text className="text-xs text-gray-300 text-right mt-1">{val.length}/200</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Tip box */}
                <View className="flex-row items-start gap-3 bg-blue-50 rounded-2xl p-4 mb-6">
                    <Lightbulb color="#3B82F6" size={18} style={{ marginTop: 1 }} />
                    <Text className="flex-1 text-xs text-blue-600 leading-5">
                        <Text className="font-bold">Consejo: </Text>
                        Sé específico con tus metas. En lugar de "Leer más", intenta "Leer 10 páginas diarias".
                    </Text>
                </View>

                {/* Save button */}
                <Pressable className="bg-[#002d4e] rounded-2xl py-5 flex-row items-center justify-center gap-3 active:opacity-80">
                    <Save color="#fff" size={20} />
                    <Text className="text-white font-bold text-base">Guardar Cambios</Text>
                </Pressable>
            </ScrollView>

            {/* Floating quick-area buttons */}
            <View className="absolute right-5 bottom-32 gap-3">
                {AREAS.filter((a) => a.id !== area.id).slice(0, 3).map((a) => {
                    const QuickIcon = a.icon;
                    return (
                        <Pressable
                            key={a.id}
                            className="w-12 h-12 rounded-full items-center justify-center active:opacity-70"
                            style={{
                                backgroundColor: a.iconBg,
                                shadowColor: '#000',
                                shadowOpacity: 0.1,
                                shadowRadius: 6,
                                elevation: 4,
                            }}
                            onPress={() => router.replace(`/editar-metas?areaId=${a.id}`)}
                        >
                            <QuickIcon color={a.iconColor} size={20} />
                        </Pressable>
                    );
                })}
            </View>
        </KeyboardAvoidingView>
    );
}
