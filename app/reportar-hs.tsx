import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Clock, FileText, Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReports } from '@/hooks/useReports';
import { useCategories } from '@/hooks/useCategories';

export default function ReportarHS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createReport } = useReports();
  const { data: categories } = useCategories();

  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      // Build multipart/form-data — evidence file is optional in this UI flow
      const formData = new FormData();
      formData.append('hours_spent', String(parsedHours));
      formData.append('category_id', String(categoryId));
      formData.append('description', description.trim());
      // evidence is required by the API; attach a placeholder or skip until
      // a document picker is integrated
      // formData.append('evidence', { uri, name, type } as any);

      await createReport(formData);
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full border ${categoryId === cat.id ? 'bg-[#002d4e] border-[#002d4e]' : 'bg-white border-gray-200'}`}
                  >
                    <Text className={`text-sm font-medium ${categoryId === cat.id ? 'text-white' : 'text-gray-600'}`}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {/* Date field */}
        <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
          Fecha del Servicio
        </Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-5 h-14">
          <Calendar color="#9CA3AF" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-700 text-base"
            value={date}
            onChangeText={setDate}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#9CA3AF"
          />
        </View>

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

        {/* Evidence upload placeholder */}
        <Pressable className="border-2 border-dashed border-gray-300 rounded-2xl py-8 items-center justify-center mb-8 active:opacity-70">
          <Camera color="#9CA3AF" size={32} />
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-3">
            Subir Evidencia (PDF)
          </Text>
        </Pressable>

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
          Brújula de Vida • Funval Internacional
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
