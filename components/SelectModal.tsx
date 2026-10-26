import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, Search, X } from 'lucide-react-native';
import { COLORS, OVERLAY } from '@/constants/theme';
import { normalizeName } from '@/constants/areas';

interface SelectModalOption<T> {
  value: T;
  label: string;
  /** Optional secondary line (e.g. the category's description). */
  description?: string | null;
}

interface SelectModalProps<T> {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: SelectModalOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  /** Force the search box on/off; by default it appears with more than SEARCH_THRESHOLD options. */
  searchable?: boolean;
}

/** A search box appears once the list is long enough to need it. */
const SEARCH_THRESHOLD = 6;

/** Centered single-choice list with optional search, styled like the app's other modals. */
export default function SelectModal<T extends string | number | null>({
  visible,
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  onClose,
  searchable: searchableProp,
}: SelectModalProps<T>) {
  const [query, setQuery] = useState('');
  /** Height of the card with the full list, so short lists don't shrink while filtering. */
  const [openHeight, setOpenHeight] = useState<number | null>(null);
  const searchable = searchableProp ?? options.length > SEARCH_THRESHOLD;
  const longList = options.length > SEARCH_THRESHOLD;

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setOpenHeight(null);
    }
  }, [visible]);

  const filtered = useMemo(() => {
    const q = normalizeName(query);
    if (!q) return options;
    return options.filter((o) => normalizeName(`${o.label} ${o.description ?? ''}`).includes(q));
  }, [options, query]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Modals live in their own window, which neither platform resizes for the keyboard */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: OVERLAY }}>
        <Pressable className="flex-1 justify-center px-6" onPress={onClose}>
          {/*
          Size limits: long lists get a fixed 70% of the visible area (the list
          scrolls inside); short lists fit their content up to 75% and keep the
          height they opened with while filtering. Percentages are of the area
          above the keyboard, so the card never ends up behind it.
        */}
          <Pressable
            className={`overflow-hidden rounded-3xl bg-white ${longList ? 'h-[70%]' : 'max-h-[75%]'}`}
            style={!longList && query && openHeight ? { height: openHeight } : undefined}
            onLayout={(e) => {
              if (!longList && !query && openHeight == null)
                setOpenHeight(e.nativeEvent.layout.height);
            }}
            onPress={() => {}}>
            <View className="px-5 pb-3 pt-5">
              <Text className="text-heading font-bold text-ink">{title}</Text>
              {subtitle ? <Text className="text-label text-muted">{subtitle}</Text> : null}
              {searchable ? (
                <View className="mt-3 h-12 flex-row items-center gap-2 rounded-2xl bg-gray-100 px-3">
                  <Search color={COLORS.faint} size={18} />
                  <TextInput
                    className="flex-1 text-body text-ink"
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar…"
                    placeholderTextColor={COLORS.faint}
                    autoCorrect={false}
                    returnKeyType="search"
                    accessibilityLabel={`Buscar en ${title}`}
                  />
                  {query ? (
                    <Pressable
                      onPress={() => setQuery('')}
                      hitSlop={10}
                      accessibilityLabel="Borrar búsqueda">
                      <X color={COLORS.faint} size={18} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}
              ListEmptyComponent={
                <Text className="px-3 py-4 text-center text-label text-muted">
                  No hay opciones que coincidan.
                </Text>
              }
              renderItem={({ item }) => {
                const selected = selectedValue === item.value;
                return (
                  <Pressable
                    className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-gray-50"
                    style={selected ? { backgroundColor: '#EEF4FD' } : undefined}
                    onPress={() => {
                      onSelect(item.value);
                      onClose();
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}>
                    <View
                      className="h-6 w-6 items-center justify-center rounded-full"
                      style={
                        selected
                          ? { backgroundColor: COLORS.navy }
                          : { borderWidth: 2, borderColor: COLORS.line }
                      }>
                      {selected ? <Check color={COLORS.white} size={14} strokeWidth={3} /> : null}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-body ${selected ? 'font-semibold text-navy' : 'text-ink'}`}>
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text className="text-caption text-muted" numberOfLines={2}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
            <Pressable
              className="mx-5 my-3 h-12 items-center justify-center rounded-2xl active:bg-gray-50"
              onPress={onClose}>
              <Text className="text-body font-semibold text-muted">Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
