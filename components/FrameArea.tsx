import { SafeAreaView } from "react-native-safe-area-context";  
import { ReactNode } from "react";

interface FrameAreaProps {
    children: ReactNode;
}

export default function FrameArea({ children }: FrameAreaProps) {
    return (
        <SafeAreaView className="flex-1 bg-white p-4">
            {children}
        </SafeAreaView>
    );
}
