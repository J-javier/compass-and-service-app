import { Image, Text, Pressable , View } from "react-native";
import Avatar from "../../components/Avatar";
import FrameArea  from "../../components/FrameArea";
import { LogOut , Clock, Compass, ChevronRight } from "lucide-react-native";
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
            onPress: () => console.log("Brujula Pressed")   
        },
        {
            id: 2,
            title: "Horas de Servicio",
            description: "Registro de mis horas de servicio",
            icon: <Clock size={28} color='white' />,
            onPress: () => console.log("Horas de Servicio Pressed")   
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
                source={require("../../assets/Blanco_logo.jpg")}
                alt="Compass Home"
            />
            <Text className="text-lg mt-4 text-gray-500 mb-6">Selecciona una opción</Text>

            {/* La carga debe ser dinamica de 2 opciones una la brujula y la otra horas de servicio */}
            {/* Esta bien pero es mi componente que debo de renderizar  */}
            {
                
            }

            <Pressable className="bg-red-500 p-5 rounded-lg mt-4 flex-row items-center justify-center m-5 gap-1 active:bg-red-300 transition-colors duration-200 absolute bottom-0 left-0 right-0">
                <LogOut color="#fff" size={20} className="mb-1" />
                <Text className="text-white text-center">Cerrar Sesión</Text>
            </Pressable>
        </FrameArea>
    );
}   