import { Pressable, ScrollView, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Option<T> {
  value: T;
  label: string;
  count?: number;
  /** Fill color when active (status color); navy by default. */
  color?: string;
}

interface Props<T> {
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/** Horizontal filter chips with an optional count and status color per option. */
export default function FilterChips<T>({ options, selected, onSelect }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((opt) => {
        const active = opt.value === selected;
        const fill = opt.color ?? COLORS.navy;
        return (
          <Pressable
            key={String(opt.value)}
            className="flex-row items-center gap-1.5 rounded-full border px-4 py-2 active:opacity-70"
            style={active ? { backgroundColor: fill, borderColor: fill } : { backgroundColor: COLORS.white, borderColor: COLORS.line }}
            onPress={() => onSelect(opt.value)}
          >
            <Text className="text-label font-semibold" style={{ color: active ? COLORS.white : '#33445A' }}>
              {opt.label}
            </Text>
            {opt.count != null ? (
              <Text className="text-caption font-bold" style={{ color: active ? 'rgba(255,255,255,0.85)' : COLORS.faint }}>
                {opt.count}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
