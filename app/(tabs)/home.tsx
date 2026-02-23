import { Image, Text, Pressable , View } from "react-native";
import Avatar from "../../components/Avatar";
import FrameArea  from "../../components/FrameArea";
import { LogOut } from "lucide-react-native";


export default function Home() {
    const img = require("../../assets/Avatar-profile.png");
    const name = "John Marriot Doe Lipz";


    return (
        <FrameArea>
            <View className="flex-row items-center justify-between p-6">
                <View>
                    <Text className="text-gray-500">Welcome back</Text>
                    <Text className="text-2xl ">
                        {name}
                    </Text>
                </View>
                <Avatar
                    name={name}
                    imageUrl={img}
                />
            </View>
            <Image 
                className="w-full h-32 object-cover border border-solid border-gray-500"
                source={require("../../assets/Blanco_logo.jpg")}
                alt="Compass Home"
            />
            <Text className="text-lg mt-4 text-gray-500">Selecciona una opción</Text>

            <Pressable className="bg-red-500 p-5 rounded-lg mt-4 flex-row items-center justify-center gap-1 active:bg-red-300 transition-colors duration-200">
                <LogOut color="#fff" size={20} className="mb-1" />
                <Text className="text-white text-center">Cerrar Sesión</Text>
            </Pressable>
        </FrameArea>
    );
}   