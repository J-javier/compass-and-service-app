import { Image,View } from "react-native";

export default function Avatar({ name, imageUrl }: { name: string; imageUrl: any }) {
    return (
        <View className="flex items-center space-x-4">       
            <Image
                className="w-14 h-14 rounded-full"
                source={imageUrl}  
                alt={name}
            />
        </View>
    );
}