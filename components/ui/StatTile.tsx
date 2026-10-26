import { Text, View } from 'react-native';
import { CARD_SHADOW } from '@/constants/theme';

interface Props {
  value: string;
  label: string;
  color: string;
}

/** Small white tile with a colored value — used for per-status hour counts. */
export default function StatTile({ value, label, color }: Props) {
  return (
    <View className="flex-1 rounded-2xl bg-white px-3 py-3" style={CARD_SHADOW}>
      <Text className="text-heading font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-caption text-muted">{label}</Text>
    </View>
  );
}
