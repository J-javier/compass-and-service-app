import { Pressable, ScrollView, Text } from 'react-native';

interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export default function FilterChips<T>({ options, selected, onSelect }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable
            key={String(opt.value)}
            className={`px-4 py-2 rounded-full border active:opacity-70 ${active ? 'bg-[#002d4e] border-[#002d4e]' : 'bg-white border-gray-200'}`}
            onPress={() => onSelect(opt.value)}
          >
            <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-600'}`}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
