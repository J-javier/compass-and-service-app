import { Image, Text, View } from "react-native";
import Avatar from "../../components/Avatar";
import FrameArea  from "../../components/FrameArea";


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
        </FrameArea>
    );
}   