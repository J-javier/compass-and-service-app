import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { ReactNode } from "react";

interface CardOptionProps {
    title: string;
    description: string;
    icon: ReactNode;
    bgColor?: string;
}

export default function CardOption({ title, description, icon, bgColor }: CardOptionProps) {
    return (
        <Pressable
            className="bg-white p-4 rounded-3xl flex-row items-center justify-around h-36 active:opacity-70"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 6 }}
        >
            <View className={`rounded-2xl ${bgColor} p-4 h-20 w-20 items-center justify-center`}>
                {icon}
            </View>
            <View className="mt-2">
                <Text className="text-2xl font-medium text-gray-700">{title}</Text>
                <Text className="text-base text-gray-500 w-40">{description}</Text>
            </View>
            <ChevronRight color='#9CA3AF' size={22} />
        </Pressable>
    );
}
