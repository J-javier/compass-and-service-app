import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Lightbulb, X } from 'lucide-react-native';
import { SubcategoryGuide } from '@/constants/goalGuides';

interface Props {
  visible: boolean;
  title: string;
  guide: SubcategoryGuide | undefined;
  accentColor: string;
  onClose: () => void;
}

export default function GoalGuideModal({ visible, title, guide, accentColor, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-3xl p-5 max-h-[80%]" onPress={() => {}}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2 flex-1">
              <Lightbulb color={accentColor} size={20} />
              <Text className="text-base font-bold text-gray-900 flex-1">{title}</Text>
            </View>
            <Pressable className="p-1 active:opacity-70" onPress={onClose}>
              <X color="#9CA3AF" size={20} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {guide?.description ? (
              <Text className="text-sm text-gray-600 leading-6 mb-4">{guide.description}</Text>
            ) : null}
            <Text className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Ejemplos</Text>
            {guide?.examples.length ? (
              <View className="gap-2">
                {guide.examples.map((ex) => (
                  <View key={ex} className="rounded-xl bg-gray-50 px-3 py-2 border-l-4" style={{ borderLeftColor: accentColor }}>
                    <Text className="text-sm text-gray-700 italic">&ldquo;{ex}&rdquo;</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-400">Escribe tu meta en primera persona y en presente: &ldquo;Yo...&rdquo;</Text>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
