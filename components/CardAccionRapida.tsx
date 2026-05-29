import React from 'react';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View, Text } from 'react-native';
import { router } from 'expo-router';

interface Props {
    icon: React.ReactElement;
    iconBgClass: string;
    title: string;
    subtitle: string;
    href: string;
}

function CardAccionRapida({ icon, iconBgClass, title, subtitle, href }: Props) {
    return (
        <Pressable
            className="flex-row items-center gap-4 rounded-2xl bg-white p-4 active:opacity-70"
            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
            onPress={() => router.push(href)}>
            <View className={`h-12 w-12 items-center justify-center rounded-xl ${iconBgClass}`}>
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">{title}</Text>
                <Text className="text-sm text-gray-400">{subtitle}</Text>
            </View>
            <ChevronRight color="#D1D5DB" size={20} />
        </Pressable>
    );
}

export default CardAccionRapida;
