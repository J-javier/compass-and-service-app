import { View } from 'react-native';

interface Props {
  /** 0–100; clamped. */
  percent: number;
  trackClass?: string;
  fillClass?: string;
  heightClass?: string;
}

export default function ProgressBar({
  percent,
  trackClass = 'bg-gray-200',
  fillClass = 'bg-blue-500',
  heightClass = 'h-2',
}: Props) {
  const width = Math.max(0, Math.min(percent, 100));
  return (
    <View className={`${heightClass} ${trackClass} rounded-full overflow-hidden`}>
      <View className={`h-full ${fillClass} rounded-full`} style={{ width: `${width}%` }} />
    </View>
  );
}
