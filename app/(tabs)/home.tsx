import { Image, Text, Pressable , View } from "react-native";
import Avatar from "../../components/Avatar";
import FrameArea  from "../../components/FrameArea";
import { LogOut , Clock, Compass } from "lucide-react-native";
import CardOption from "components/CardOption";


export default function Home() {
    const img = require("../../assets/Avatar-profile.png");
    const name = "John Marriot Doe Lipz";
    const options = [
        {
            id: 1,
            title: "Brujula",
            description: "Mis Metas y Planes de Vida",
            icon: <Compass size={28} color='white' />,
            bgColor: "bg-blue-950",
        },
        {
            id: 2,
            title: "Horas de Servicio",
            description: "Registro de mis horas de servicio",
            icon: <Clock size={28} color='white' />,
            bgColor: "bg-blue-500",
        }
    ];

    return (
        <FrameArea>
            <View className="flex-row items-center justify-between mb-5 mt-3">
                <View>
                    <Text className="text-gray-500 text-lg">Bienvenido de nuevo</Text>
                    <Text className="text-2xl font-bold text-[#002d4e]">
                        {name}
                    </Text>
                </View>
                <Avatar
                    name={name}
                    imageUrl={img}
                />
            </View>
            <Image 
                className="w-full h-32 object-cover"
                source={require("../../assets/Sinfondo.png")}
                alt="Compass Home"
            />
            <Text className="text-lg mt-8 text-gray-500 mb-8">Selecciona una opción</Text>

            <View className="gap-6 mb-8">
                {options.map((option) => (
                    <CardOption
                        key={option.id}
                        title={option.title}
                        description={option.description}
                        icon={option.icon}
                        bgColor={option.bgColor}
                    />
                ))}
            </View>

            <Pressable className="bg-red-500 p-5 rounded-lg flex-row items-center justify-center gap-1 active:bg-red-300 transition-colors duration-200 absolute bottom-7 left-4 right-4">
                <LogOut color="#fff" size={20}/>
                <Text className="text-white text-center">Cerrar Sesión</Text>
            </Pressable>
        </FrameArea>
    );
}   