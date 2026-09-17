import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, Clock, FileText, Camera, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useReports } from '@/hooks/useReports';
import { useCategories } from '@/hooks/useCategories';
import SelectModal from '@/components/SelectModal';

export default function ReportarHS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createReport } = useReports();
  const { data: categories } = useCategories();

  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [evidence, setEvidence] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  const handlePickEvidence = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      // Android document providers unreliably filter by MIME type, so fall
      // back to checking the file extension as well.
      const looksLikePdf =
        asset.mimeType === 'application/pdf' || asset.name.toLowerCase().endsWith('.pdf');
      if (!looksLikePdf) {
        Alert.alert('Archivo inválido', 'Debes seleccionar un archivo PDF');
        return;
      }
      setEvidence(asset);
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleSubmit = async () => {
    if (!hours.trim() || !description.trim()) {
      Alert.alert('Error', 'Las horas y la descripción son obligatorias');
      return;
    }
    const parsedHours = parseFloat(hours.replace(',', '.'));
    if (isNaN(parsedHours) || parsedHours <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad de horas válida');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }
    if (!evidence) {
      Alert.alert('Error', 'Debes adjuntar un archivo PDF como evidencia');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('hours_spent', String(parsedHours));
      formData.append('category_id', String(categoryId));
      formData.append('description', description.trim());
      formData.append('evidence', {
        uri: evidence.uri,
        name: evidence.name,
        type: evidence.mimeType ?? 'application/pdf',
      } as any);

      await createReport(formData);
      setEvidence(null);
      Alert.alert('Éxito', 'Reporte enviado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Error al enviar el reporte';
      Alert.alert('Error', typeof msg === 'string' ? msg : 'Error al enviar el reporte');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <Pressable
          className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#002d4e" size={24} />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-[#002d4e] uppercase tracking-wider">
          Reportar HS
        </Text>
        <View className="w-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        {/* Logo */}
        <View className="items-center mb-6">
          <Image
            source={require('../assets/logoTres.png')}
            style={{ width: 250, height: 80 }}
            resizeMode="contain"
          />
        </View>

        {/* Info card */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-8">
          <Text className="text-blue-700 text-sm leading-6">
            Registra tus horas de servicio aquí. Asegúrate de que la descripción sea detallada
            para facilitar la validación.
          </Text>
        </View>

        {/* Category selector */}
        {categories.length > 0 && (
          <>
            <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
              Categoría
            </Text>
            <Pressable
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 mb-5 h-14"
              onPress={() => setCategoryPickerOpen(true)}
            >
              <Text className={`text-base ${selectedCategory ? 'text-gray-700' : 'text-gray-400'}`}>
                {selectedCategory ? selectedCategory.name : 'Selecciona una categoría'}
              </Text>
              <ChevronDown color="#9CA3AF" size={20} />
            </Pressable>

            <SelectModal
              visible={categoryPickerOpen}
              title="Categoría"
              options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
              selectedValue={categoryId}
              onSelect={setCategoryId}
              onClose={() => setCategoryPickerOpen(false)}
            />
          </>
        )}

        {/* Hours field */}
        <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
          Cantidad de Horas
        </Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-5 h-14">
          <Clock color="#9CA3AF" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-700 text-base"
            value={hours}
            onChangeText={setHours}
            placeholder="0.0"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Description field */}
        <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
          Descripción de la Actividad
        </Text>
        <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-5 flex-row gap-3">
          <FileText color="#9CA3AF" size={20} style={{ marginTop: 2 }} />
          <TextInput
            className="flex-1 text-gray-700 text-base"
            value={description}
            onChangeText={setDescription}
            placeholder="¿Qué servicio realizaste?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />
        </View>

        {/* Evidence upload */}
        {evidence ? (
          <View className="flex-row items-center justify-between border border-gray-200 rounded-2xl px-4 py-4 mb-8 bg-white">
            <View className="flex-row items-center gap-3 flex-1">
              <FileText color="#002d4e" size={20} />
              <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>
                {evidence.name}
              </Text>
            </View>
            <Pressable onPress={() => setEvidence(null)} className="p-1 active:opacity-70">
              <X color="#9CA3AF" size={18} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="border-2 border-dashed border-gray-300 rounded-2xl py-8 items-center justify-center mb-8 active:opacity-70"
            onPress={handlePickEvidence}
          >
            <Camera color="#9CA3AF" size={32} />
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-3">
              Subir Evidencia (PDF)
            </Text>
          </Pressable>
        )}

        {/* Submit button */}
        <Pressable
          className="bg-[#002d4e] rounded-2xl py-5 flex-row items-center justify-center gap-3 active:opacity-80 mb-4"
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base uppercase tracking-wider">
              Enviar Reporte
            </Text>
          )}
        </Pressable>

        <Text className="text-center text-xs text-gray-400 tracking-widest uppercase">
          Horas de Servicio • Funval Internacional
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
