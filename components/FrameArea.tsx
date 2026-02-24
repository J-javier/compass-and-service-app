import { SafeAreaView } from "react-native-safe-area-context";  
import { ReactNode } from "react";

interface FrameAreaProps {
    children: ReactNode;
}

export default function FrameArea({ children }: FrameAreaProps) {
    return (
        <SafeAreaView className="flex-1 bg-gray-100 p-7">
            {children}
        </SafeAreaView>
    );
}
