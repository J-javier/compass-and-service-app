import { Pressable, Text, TextInput, View } from 'react-native';
import { Info } from 'lucide-react-native';
import { FieldStatus } from '@/hooks/useGoalAutosave';

export const GOAL_MAX_LENGTH = 180;

interface CardGoalsProps {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  areaAccentColor: string;
  selectedYear: number;
  status: FieldStatus;
  errorMessage?: string;
  onHelp?: () => void;
  editable?: boolean;
}

const STATUS_LABEL: Record<FieldStatus, string> = {
  idle: '',
  pending: 'Cambios sin guardar...',
  saving: 'Guardando...',
  saved: 'Guardado ✓',
  error: 'Error al guardar',
};

const STATUS_CLASS: Record<FieldStatus, string> = {
  idle: 'text-gray-300',
  pending: 'text-amber-500',
  saving: 'text-blue-500',
  saved: 'text-green-600',
  error: 'text-red-500',
};

export default function CardGoals({
  title,
  value,
  onChangeText,
  areaAccentColor,
  selectedYear,
  status,
  errorMessage,
  onHelp,
  editable = true,
}: CardGoalsProps) {
  return (
    <View
      className="bg-white rounded-2xl overflow-hidden"
      style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
    >
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-1 h-5 rounded-full" style={{ backgroundColor: areaAccentColor }} />
          <Text className="text-base font-bold text-gray-800 flex-shrink">{title}</Text>
          {onHelp ? (
            <Pressable className="p-1 active:opacity-70" onPress={onHelp} hitSlop={8}>
              <Info color="#9CA3AF" size={16} />
            </Pressable>
          ) : null}
        </View>
        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Meta {selectedYear}</Text>
      </View>
      <View className="px-4 pb-3">
        <TextInput
          className="text-gray-700 text-sm leading-6"
          value={value}
          onChangeText={onChangeText}
          placeholder="Yo..."
          placeholderTextColor="#9CA3AF"
          multiline
          editable={editable}
          maxLength={GOAL_MAX_LENGTH}
          textAlignVertical="top"
          style={{ minHeight: 80 }}
        />
        <View className="flex-row items-center justify-between mt-1">
          <Text className={`text-xs ${STATUS_CLASS[status]}`} numberOfLines={1}>
            {status === 'error' && errorMessage ? errorMessage : STATUS_LABEL[status]}
          </Text>
          <Text className="text-xs text-gray-300">{value.length}/{GOAL_MAX_LENGTH}</Text>
        </View>
      </View>
    </View>
  );
}
