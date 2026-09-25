import { Text, View } from 'react-native';

interface Props {
  label: string;
  bgClass: string;
  textClass: string;
}

export default function StatusPill({ label, bgClass, textClass }: Props) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${bgClass}`}>
      <Text className={`text-xs font-semibold ${textClass}`}>{label}</Text>
    </View>
  );
}
