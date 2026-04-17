import { useRouter } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
    area: {
        id: number;
        name: string;
        subtitle: string;
        icon: React.ComponentType<{ color?: string; size?: number }>;
        iconColor: string;
        iconBg: string;
        status: 'COMPLETO' | 'PENDIENTE';
    };
}

function CardAreasBrujula({ area }: Props) {
    const router = useRouter();
    const isPending = area.status === 'PENDIENTE';
    const IconComp = area.icon;

    return (
        <Pressable
            className={`flex-row items-center gap-4 rounded-2xl bg-white p-4 active:opacity-70 ${isPending ? 'border border-dashed border-gray-200' : ''}`}
            style={ { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 } }
            onPress={() => router.push('/editar-metas')}>
            <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: area.iconBg }}>
                <IconComp color={area.iconColor} size={22} />
            </View>

            <View className="flex-1">
                <Text
                    className={`text-base font-semibold text-gray-800`}>
                    {area.name}
                </Text>
                <Text className="text-sm text-gray-400">{area.subtitle}</Text>
            </View>
            {isPending ? (
                <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium text-gray-400">{area.status}</Text>
                    <View className="h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300">
                        <Plus color="#9CA3AF" size={14} />
                    </View>
                </View>
            ) : (
                <View className="flex-row items-center gap-2">
                    <View className="rounded-lg bg-green-100 px-2 py-1">
                        <Text className="text-xs font-bold text-green-600">{area.status}</Text>
                    </View>
                    <ChevronRight color="#D1D5DB" size={18} />
                </View>
            )}
        </Pressable>
    );
}

export default CardAreasBrujula;
