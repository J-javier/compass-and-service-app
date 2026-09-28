import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Lightbulb, X } from 'lucide-react-native';
import { VISION_GUIDE } from '@/constants/visionGuide';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function VisionGuideModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-3xl p-5 max-h-[80%]" onPress={() => {}}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2 flex-1">
              <Lightbulb color="#F59E0B" size={20} />
              <Text className="text-base font-bold text-gray-900 flex-1">Mi Visión Personal</Text>
            </View>
            <Pressable className="p-1 active:opacity-70" onPress={onClose}>
              <X color="#9CA3AF" size={20} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-sm text-gray-600 leading-6 mb-4">{VISION_GUIDE.description}</Text>
            <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Preguntas guía</Text>
            <View className="gap-2">
              {VISION_GUIDE.questions.map((q) => (
                <View key={q} className="rounded-xl bg-gray-50 px-3 py-2 border-l-4 border-amber-400">
                  <Text className="text-sm text-gray-700">{q}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
