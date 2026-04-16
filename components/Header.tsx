import { CalendarDays } from "lucide-react-native/icons"
import { Text, View } from "react-native"


interface Props {
    user: {
        initials: string;
        name: string;
        role: string;
        plan: string;
    };
}

function Header({ user }: Props) {

    return (
         <View className="flex-row items-center gap-4 mb-5 pr-5 pl-5 pt-5">
                <View className="w-16 h-16 rounded-2xl bg-[#002d4e] items-center justify-center">
                    <Text className="text-white text-xl font-bold">{user.initials}</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">{user.name}</Text>
                    <Text className="text-sm text-gray-500 mb-1">{user.role}</Text>
                    <View className="flex-row items-center gap-1">
                        <CalendarDays color="#3B82F6" size={13} />
                        <Text className="text-xs text-blue-500 font-medium uppercase tracking-wide">
                            Plan {user.plan}
                        </Text>
                    </View>
                </View>
                <View className="w-3 h-3 rounded-full bg-green-500" />
            </View>
    )
}

export default Header
