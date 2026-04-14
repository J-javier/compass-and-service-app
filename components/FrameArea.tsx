import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode } from "react";

interface FrameAreaProps {
    children: ReactNode;
}

export default function FrameArea({ children }: FrameAreaProps) {
    const insets = useSafeAreaInsets();
    const basePadding = 28;

    return (
        <View
            className="flex-1 bg-gray-100"
            style={{
                paddingTop: insets.top + basePadding,
                paddingLeft: insets.left + basePadding,
                paddingRight: insets.right + basePadding,
            }}
        >
            {children}
        </View>
    );
}
