import { Text, View } from "react-native";
import { Compass, ChevronRight } from "lucide-react-native";



export default function CardOption() {
    return (
        <View className="bg-white p-4 rounded-3xl flex-row items-center justify-around h-36 "
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 6 }}>  
            <View className="rounded-2xl bg-blue-950 p-4 h-20 w-20 items-center justify-center">
                <Compass size={28} color='white' />
            </View>
            <View className="mt-2">
                <Text className="text-2xl font-medium text-gray-700">Brujula </Text>
                <Text className="text-base text-gray-500 w-40">Mis Metas y Planes de Vida</Text>
            </View>
            <ChevronRight color='#9CA3AF' size={22} />
        </View>
    );
}