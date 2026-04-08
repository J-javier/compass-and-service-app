import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { ReactNode } from "react";
import { Link } from "expo-router";

interface CardOptionProps {
    title: string;
    description: string;
    icon: ReactNode;
    bgColor?: string;
    enlace?: string;
}

export default function CardOption({ title, description, icon, bgColor, enlace }: CardOptionProps) {
    return (
            <Link href={enlace || "#"}>
                <Pressable
                    className="bg-white p-4 rounded-3xl flex-row items-center justify-around h-36 active:opacity-70 w-full"
                    style={{ shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, elevation: 8 }}
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
            </Link>
    );
}
