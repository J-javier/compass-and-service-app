import { Text, TextInput, View } from 'react-native';

interface CardGoalsProps {
  goal: { id: string | number; name: string; placeholder: string };
  value: string;
  onChangeText: (text: string) => void;
  areaAccentColor: string;
  selectedYear: number;
}

export default function CardGoals({ goal, value, onChangeText, areaAccentColor, selectedYear }: CardGoalsProps) {
  return (
    <View
      className="bg-white rounded-2xl overflow-hidden"
      style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
    >
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-1 h-5 rounded-full" style={{ backgroundColor: areaAccentColor }} />
          <Text className="text-base font-bold text-gray-800">{goal.name}</Text>
        </View>
        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
          Meta {selectedYear}
        </Text>
      </View>
      <View className="px-4 pb-3">
        <TextInput
          className="text-gray-700 text-sm leading-6"
          value={value}
          onChangeText={onChangeText}
          placeholder={goal.placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={200}
          textAlignVertical="top"
          style={{ minHeight: 80 }}
        />
        <Text className="text-xs text-gray-300 text-right mt-1">{value.length}/200</Text>
      </View>
    </View>
  );
}
