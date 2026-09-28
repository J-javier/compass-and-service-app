import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, ChevronLeft, Info, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VisionGuideModal from '@/components/VisionGuideModal';
import { useCompass } from '@/hooks/useCompass';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/apiError';

const MAX_VISION = 5000;

export default function ConfigurarPlan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createPlan } = useCompass();

  const [startYear, setStartYear] = useState(String(new Date().getFullYear()));
  const [vision, setVision] = useState('');
  const [saving, setSaving] = useState(false);
  const [showVisionGuide, setShowVisionGuide] = useState(false);

  const handleSave = async () => {
    const year = parseInt(startYear, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      Alert.alert('Error', 'Ingresa un año de inicio válido (2000 - 2100)');
      return;
    }
    // The backend accepts an empty vision, but goals can't be created
    // without one — require it here so the student isn't stuck.
    if (!vision.trim()) {
      Alert.alert('Error', 'Escribe tu visión personal para poder cargar tus metas');
      return;
    }
    setSaving(true);
    try {
      await createPlan({ start_year: year, vision: vision.trim() });
      router.replace('/(tabs)/brujula');
    } catch (e) {
      const msg = getApiErrorMessage(e, 'No se pudo crear el plan');
      if (getApiErrorCode(e) === 'plan_already_exists') {
        Alert.alert('Plan existente', msg, [{ text: 'OK', onPress: () => router.replace('/(tabs)/brujula') }]);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <Pressable className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100" onPress={() => router.back()}>
          <ChevronLeft color="#002d4e" size={24} />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900">Configurar mi Brújula</Text>
        <View className="w-9" />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <Text className="text-blue-700 text-sm leading-6">
            Tu Brújula de Vida es un plan a 5 años. Elige el año en que empieza y escribe tu visión personal:
            hacia dónde quieres llegar. Podrás editar la visión cuando quieras.
          </Text>
        </View>

        <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">Año de inicio</Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-1 h-14">
          <CalendarDays color="#9CA3AF" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-700 text-base"
            value={startYear}
            onChangeText={(t) => setStartYear(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
        <Text className="text-xs text-gray-400 mb-5">
          {/^\d{4}$/.test(startYear)
            ? `Tu plan cubrirá ${startYear} - ${Number(startYear) + 4}. No podrás cambiar el año cuando cargues metas.`
            : ' '}
        </Text>

        <View className="flex-row items-center gap-1 mb-2">
          <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide">Mi visión personal</Text>
          <Pressable className="p-1 active:opacity-70" onPress={() => setShowVisionGuide(true)} hitSlop={8}>
            <Info color="#9CA3AF" size={16} />
          </Pressable>
        </View>
        <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-1 flex-row gap-3">
          <Sparkles color="#F59E0B" size={20} style={{ marginTop: 2 }} />
          <TextInput
            className="flex-1 text-gray-700 text-base"
            value={vision}
            onChangeText={setVision}
            placeholder="¿Cómo te ves en 5 años?"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={MAX_VISION}
            textAlignVertical="top"
            style={{ minHeight: 140 }}
          />
        </View>
        <Text className="text-xs text-gray-400 text-right mb-8">{vision.length}/{MAX_VISION}</Text>

        <Pressable
          className="bg-[#002d4e] rounded-2xl py-5 items-center justify-center active:opacity-80"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Guardar</Text>}
        </Pressable>
      </ScrollView>

      <VisionGuideModal visible={showVisionGuide} onClose={() => setShowVisionGuide(false)} />
    </KeyboardAvoidingView>
  );
}
