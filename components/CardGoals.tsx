import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AlertTriangle, CloudCheck, HelpCircle, LoaderCircle, PenLine } from 'lucide-react-native';
import { CARD_SHADOW, COLORS } from '@/constants/theme';
import { FieldStatus } from '@/hooks/useGoalAutosave';

const GOAL_MAX_LENGTH = 180;

interface CardGoalsProps {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  areaAccentColor: string;
  selectedYear: number;
  status: FieldStatus;
  errorMessage?: string;
  onHelp?: () => void;
  onRetry?: () => void;
  editable?: boolean;
}

const STATUS_UI: Record<Exclude<FieldStatus, 'idle'>, { label: string; color: string; Icon: typeof CloudCheck; outline?: string }> = {
  pending: { label: 'Sin guardar', color: '#B45309', Icon: PenLine },
  saving: { label: 'Guardando…', color: '#B45309', Icon: LoaderCircle, outline: '#FCD34D' },
  saved: { label: 'Guardado', color: '#15803D', Icon: CloudCheck },
  error: { label: 'Reintentar', color: '#B91C1C', Icon: AlertTriangle, outline: '#FCA5A5' },
};

/**
 * Autosaved goal field for one subcategory and year. The whole card focuses the
 * input (an easier touch target) and its border highlights the field being
 * typed in.
 */
export default function CardGoals({
  title,
  value,
  onChangeText,
  areaAccentColor,
  selectedYear,
  status,
  errorMessage,
  onHelp,
  onRetry,
  editable = true,
}: CardGoalsProps) {
  const ui = status === 'idle' ? null : STATUS_UI[status];
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  /**
   * Border priority: error > the field being typed in (area color) > saving.
   * The 2px border is always there (transparent when idle) so focusing doesn't
   * shift the layout.
   */
  const borderColor =
    status === 'error' ? STATUS_UI.error.outline : focused ? areaAccentColor : ui?.outline ?? 'transparent';

  return (
    <Pressable
      className="rounded-2xl bg-white p-4"
      style={[CARD_SHADOW, { borderWidth: 2, borderColor }]}
      onPress={() => inputRef.current?.focus()}
      disabled={!editable}
      accessible={false}
    >
      <View className="mb-2 flex-row items-center justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-2">
          <View className="h-5 w-1 rounded-full" style={{ backgroundColor: areaAccentColor }} />
          <Text className="shrink text-body font-bold text-ink">{title}</Text>
          {onHelp ? (
            <Pressable className="p-1 active:opacity-60" onPress={onHelp} hitSlop={8} accessibilityLabel={`Ideas para tu meta de ${title}`}>
              <HelpCircle color={COLORS.faint} size={16} />
            </Pressable>
          ) : null}
        </View>
        {ui ? (
          <Pressable
            className="flex-row items-center gap-1"
            disabled={status !== 'error'}
            onPress={onRetry}
            hitSlop={8}
          >
            <ui.Icon color={ui.color} size={13} />
            <Text className="text-caption font-semibold" style={{ color: ui.color }}>{ui.label}</Text>
          </Pressable>
        ) : null}
      </View>
      <TextInput
        ref={inputRef}
        className="text-body text-ink"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={`Meta de ${title} para ${selectedYear}`}
        placeholder={`Meta de ${title.toLowerCase()} para ${selectedYear}…`}
        placeholderTextColor={COLORS.faint}
        multiline
        editable={editable}
        maxLength={GOAL_MAX_LENGTH}
        textAlignVertical="top"
        style={{ minHeight: 72 }}
      />
      <View className="mt-1 flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-caption text-red-600" numberOfLines={2}>
          {status === 'error' ? errorMessage ?? 'No se pudo guardar. Toca «Reintentar».' : ''}
        </Text>
        <Text className="text-caption text-muted">{value.length}/{GOAL_MAX_LENGTH}</Text>
      </View>
    </Pressable>
  );
}
