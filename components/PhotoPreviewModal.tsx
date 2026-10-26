import { Image, Modal, Pressable, Text, View } from 'react-native';
import { RefreshCw, Trash2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

interface Props {
  /** Slot label ("Antes", "Durante", "Después"); null hides the modal. */
  label: string | null;
  /** Local URI of the photo being reviewed. */
  uri: string | null;
  onReplace: () => void;
  onRemove: () => void;
  onClose: () => void;
}

/** Full-size look at an evidence photo so the student can confirm it before sending. */
export default function PhotoPreviewModal({ label, uri, onReplace, onRemove, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const visible = label != null && uri != null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1"
        style={{
          backgroundColor: COLORS.navy,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 16,
        }}>
        <View className="h-14 flex-row items-center justify-between px-4">
          <Text className="text-heading font-bold text-white">Foto: {label}</Text>
          <Pressable
            hitSlop={12}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar vista previa">
            <X color={COLORS.white} size={24} />
          </Pressable>
        </View>

        <View className="flex-1 px-4">
          {uri ? <Image source={{ uri }} style={{ flex: 1 }} resizeMode="contain" /> : null}
        </View>

        <View className="flex-row gap-3 px-4 pt-4">
          <Pressable
            className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-white active:opacity-80"
            onPress={onReplace}
            accessibilityRole="button">
            <RefreshCw color={COLORS.navy} size={18} />
            <Text className="text-body font-semibold text-navy">Cambiar</Text>
          </Pressable>
          <Pressable
            className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/40 active:opacity-80"
            onPress={onRemove}
            accessibilityRole="button">
            <Trash2 color={COLORS.white} size={18} />
            <Text className="text-body font-semibold text-white">Quitar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
