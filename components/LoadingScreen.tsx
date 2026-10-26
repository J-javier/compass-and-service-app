import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Emblem from '@/components/brand/Emblem';
import { COLORS } from '@/constants/theme';

/** Full-screen navy loading state (session bootstrap and OAuth return). */
export default function LoadingScreen({ message = 'Iniciando sesión…' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.navy }}>
      <StatusBar style="light" />
      <Emblem size={140} animated />
      <Text className="mt-6 text-body font-semibold text-white">{message}</Text>
    </View>
  );
}
