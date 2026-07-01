import { FlatList, Modal, Pressable, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface SelectModalOption<T> {
  value: T;
  label: string;
}

interface SelectModalProps<T> {
  visible: boolean;
  title: string;
  options: SelectModalOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

export default function SelectModal<T extends string | number | null>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectModalProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl max-h-96 overflow-hidden" onPress={() => {}}>
          <Text className="text-sm font-bold text-[#002d4e] uppercase tracking-wide px-4 pt-4 pb-2">
            {title}
          </Text>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <Pressable
                className="flex-row items-center justify-between px-4 py-3 border-t border-gray-100 active:bg-gray-50"
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text
                  className={`text-base ${selectedValue === item.value ? 'text-[#002d4e] font-semibold' : 'text-gray-700'}`}
                >
                  {item.label}
                </Text>
                {selectedValue === item.value && <Check color="#002d4e" size={18} />}
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
