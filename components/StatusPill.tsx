import { Text, View } from 'react-native';

interface Props {
  label: string;
  bgClass: string;
  textClass: string;
}

/** Small rounded status label. */
export default function StatusPill({ label, bgClass, textClass }: Props) {
  return (
    <View className={`rounded-full px-2 py-0.5 ${bgClass}`}>
      <Text className={`text-overline font-semibold ${textClass}`}>{label}</Text>
    </View>
  );
}
