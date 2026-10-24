import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Lightbulb, X } from 'lucide-react-native';
import { COLORS, OVERLAY } from '@/constants/theme';
import { VISION_GUIDE } from '@/constants/visionGuide';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/** Guide for writing the personal vision (same content as the web portal). */
export default function VisionGuideModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center px-6" style={{ backgroundColor: OVERLAY }} onPress={onClose}>
        <Pressable className="max-h-[80%] rounded-3xl bg-white p-5" onPress={() => {}}>
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-2">
              <Lightbulb color="#F59E0B" size={20} />
              <Text className="flex-1 text-heading font-bold text-ink">Mi visión personal</Text>
            </View>
            <Pressable className="p-1 active:opacity-70" onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
              <X color={COLORS.faint} size={20} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-label text-muted">{VISION_GUIDE.description}</Text>
            <Text className="mb-2 text-overline font-semibold uppercase tracking-widest text-muted">Experiencia</Text>
            <Text className="mb-3 text-label text-muted">{VISION_GUIDE.experienceIntro}</Text>
            <View className="mb-4 gap-2">
              {VISION_GUIDE.questions.map((q, i) => (
                <View key={q} className="flex-row gap-2 rounded-xl border-l-4 border-amber-400 bg-gray-50 px-3 py-2">
                  <Text className="text-label font-bold text-amber-600">{i + 1}.</Text>
                  <Text className="flex-1 text-label text-ink">{q}</Text>
                </View>
              ))}
            </View>
            <Text className="text-label text-muted">{VISION_GUIDE.closing}</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
