import { Image,View } from "react-native";

export default function Avatar({ name, imageUrl }: { name: string; imageUrl: any }) {
    return (
        <View className="flex items-center space-x-4">       
            <Image
                className="w-20 h-20 rounded-full"
                source={imageUrl}  
                alt={name}
            />
        </View>
    );
}