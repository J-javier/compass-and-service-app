import { Modal, Pressable, Text, View } from 'react-native';
import { Camera, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { COLORS, OVERLAY } from '@/constants/theme';
import type { PhotoSource } from '@/lib/evidencePhotos';

interface Props {
  /** Slot label ("Antes", "Durante", "Después"); null hides the modal. */
  label: string | null;
  onSelect: (source: PhotoSource) => void;
  onClose: () => void;
}

const OPTIONS: { source: PhotoSource; title: string; subtitle: string; Icon: typeof Camera }[] = [
  { source: 'camera', title: 'Tomar foto', subtitle: 'Abre la cámara', Icon: Camera },
  { source: 'library', title: 'Elegir de la galería', subtitle: 'Usa una foto que ya tienes', Icon: ImageIcon },
];

/** Camera-or-gallery chooser, styled like the app's other modals (replaces the native Alert). */
export default function PhotoSourceModal({ label, onSelect, onClose }: Props) {
  return (
    <Modal visible={label != null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center px-6" style={{ backgroundColor: OVERLAY }} onPress={onClose}>
        <Pressable className="rounded-3xl bg-white p-5" onPress={() => {}}>
          <Text className="text-heading font-bold text-ink">Foto: {label}</Text>
          <Text className="mb-4 text-label text-muted">¿Cómo quieres agregarla?</Text>
          <View className="gap-3">
            {OPTIONS.map(({ source, title, subtitle, Icon }) => (
              <Pressable
                key={source}
                className="flex-row items-center gap-3 rounded-2xl border p-4 active:bg-gray-50"
                style={{ borderColor: COLORS.line }}
                onPress={() => onSelect(source)}
                accessibilityRole="button"
              >
                <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: '#E3EEFC' }}>
                  <Icon color={COLORS.brand} size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-body font-semibold text-ink">{title}</Text>
                  <Text className="text-caption text-muted">{subtitle}</Text>
                </View>
                <ChevronRight color={COLORS.faint} size={18} />
              </Pressable>
            ))}
          </View>
          <Pressable className="mt-4 h-12 items-center justify-center rounded-2xl active:bg-gray-50" onPress={onClose}>
            <Text className="text-body font-semibold text-muted">Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
