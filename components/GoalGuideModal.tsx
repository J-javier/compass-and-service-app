import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Lightbulb, X } from 'lucide-react-native';
import { AreaStyle } from '@/constants/areas';
import { COLORS, OVERLAY } from '@/constants/theme';

interface Props {
  visible: boolean;
  title: string;
  /** Intro paragraph (role intro or subcategory description). */
  description?: string;
  examples?: string[];
  /** Area palette: accent for icon/stripe, soft background for the example cards. */
  area: Pick<AreaStyle, 'accentColor' | 'iconBg'>;
  onClose: () => void;
}

/** Help for a role ("Mi rol familiar") or a subcategory, as in the web's "?" popovers. */
export default function GoalGuideModal({ visible, title, description, examples, area, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center px-6" style={{ backgroundColor: OVERLAY }} onPress={onClose}>
        <Pressable className="max-h-[80%] rounded-3xl bg-white p-5" onPress={() => {}}>
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-2">
              <Lightbulb color={area.accentColor} size={20} />
              <Text className="flex-1 text-heading font-bold text-ink">{title}</Text>
            </View>
            <Pressable className="p-1 active:opacity-70" onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
              <X color={COLORS.faint} size={20} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {description ? <Text className="mb-4 text-label text-muted">{description}</Text> : null}
            {examples ? (
              <>
                <Text className="mb-2 text-overline font-semibold uppercase tracking-widest text-muted">Ejemplos</Text>
                {examples.length ? (
                  <View className="gap-2">
                    {examples.map((ex) => (
                      <View
                        key={ex}
                        className="rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: area.iconBg, borderLeftWidth: 4, borderLeftColor: area.accentColor }}
                      >
                        <Text className="text-label italic text-ink">«{ex}»</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-label text-muted">Escribe tu meta en primera persona y en presente: «Yo...»</Text>
                )}
              </>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
