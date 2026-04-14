import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { ReactNode } from "react";
import { useRouter} from "expo-router";

interface CardOptionProps {
    title: string;
    description: string;
    icon: ReactNode;
    backgroundIcon?: string;
    bgColor?: string;
    textColor?: string;
    titleColor?: string;
    enlace?: string;
}

export default function CardOption({ title, description, icon, backgroundIcon, bgColor, textColor, titleColor, enlace }: CardOptionProps) {
    const router = useRouter();
    return (
            <Pressable
                    className="rounded-3xl p-6 mb-4 h-44 active:opacity-90"
                    style={{ backgroundColor: bgColor , shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
                    onPress={() => router.push(enlace || '/')}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-col gap-4 flex-1 w-full">
                            <View className="flex-row justify-between w-full">
                                <View className="w-16 h-16 rounded-2xl items-center justify-center " style={{ backgroundColor: backgroundIcon }}>
                                    {icon}
                                </View>
                                <ChevronRight size={30} color="#557b9d" />
                            </View>
                            <View>
                                <Text className={`text-2xl font-bold`} style={{ color: titleColor }}>
                                    {title}
                                </Text>
                                <Text className={`text-base`} style={{ color: textColor }}>
                                    {description}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Pressable>
    );
}
