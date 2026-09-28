import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronDown, ChevronLeft, Clock, FileText, X } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import SelectModal from '@/components/SelectModal';
import { useCategories } from '@/hooks/useCategories';
import { useReports } from '@/hooks/useReports';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/apiError';
import { isReportEditable } from '@/lib/serviceReports';

const MAX_DESCRIPTION = 2000;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export default function ReportarHS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = id ? Number(id) : null;
  const isEditing = editingId != null && !Number.isNaN(editingId);

  const { getReport, createReport, updateReport } = useReports({ autoload: false });
  const { data: categories, loading: categoriesLoading } = useCategories();

  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [evidence, setEvidence] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loadingReport, setLoadingReport] = useState(isEditing);

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  // Edit mode: preload the report
  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const report = await getReport(editingId!);
        if (cancelled) return;
        if (!isReportEditable(report)) {
          Alert.alert('No editable', 'Este reporte ya fue revisado y no se puede editar.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }
        setHours(String(report.hours_spent));
        setDescription(report.description);
        setCategoryId(report.category_id);
      } catch (e) {
        if (cancelled) return;
        Alert.alert('Error', getApiErrorMessage(e, 'No se pudo cargar el reporte'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        if (!cancelled) setLoadingReport(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEditing, editingId, getReport, router]);

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
      if (asset.size != null && asset.size > MAX_PDF_BYTES) {
        Alert.alert('Archivo muy grande', 'El PDF no puede superar los 10 MB');
        return;
      }
      setEvidence(asset);
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleSubmit = async () => {
    if (!categoryId) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }
    const parsedHours = parseFloat(hours.replace(',', '.'));
    if (isNaN(parsedHours) || parsedHours < 0.01) {
      Alert.alert('Error', 'Ingresa una cantidad de horas válida (mínimo 0.01)');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }
    if (!isEditing && !evidence) {
      Alert.alert('Error', 'Debes adjuntar un archivo PDF como evidencia');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category_id: categoryId,
        hours_spent: parsedHours,
        description: description.trim(),
        evidence: evidence
          ? { uri: evidence.uri, name: evidence.name, type: evidence.mimeType ?? 'application/pdf' }
          : undefined,
      };
      if (isEditing) {
        await updateReport(editingId!, payload);
      } else {
        await createReport(payload);
      }
      setEvidence(null);
      Alert.alert('Éxito', isEditing ? 'Reporte actualizado correctamente' : 'Reporte enviado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const msg = getApiErrorMessage(e, 'Error al enviar el reporte');
      if (getApiErrorCode(e) === 'report_not_editable') {
        Alert.alert('No editable', msg, [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <Pressable
          className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#002d4e" size={24} />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-[#002d4e] uppercase tracking-wider">
          {isEditing ? 'Editar HS' : 'Reportar HS'}
        </Text>
        <View className="w-9" />
      </View>

      {loadingReport ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002d4e" />
        </View>
      ) : (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
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
              {isEditing
                ? 'Puedes editar este reporte mientras no haya sido revisado. Adjunta un PDF solo si quieres reemplazar la evidencia actual.'
                : 'Registra tus horas de servicio aquí. Asegúrate de que la descripción sea detallada para facilitar la validación.'}
            </Text>
          </View>

          {/* 1. Category */}
          <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">Categoría</Text>
          <Pressable
            className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 mb-5 h-14"
            onPress={() => setCategoryPickerOpen(true)}
            disabled={categoriesLoading}
          >
            <Text className={`text-base ${selectedCategory ? 'text-gray-700' : 'text-gray-400'}`}>
              {categoriesLoading
                ? 'Cargando categorías...'
                : selectedCategory
                  ? selectedCategory.name
                  : 'Selecciona una categoría'}
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

          {/* 2. Hours */}
          <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">Cantidad de Horas</Text>
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

          {/* 3. Description */}
          <Text className="text-xs text-[#002d4e] font-semibold uppercase tracking-wide mb-2">
            Descripción de la Actividad
          </Text>
          <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-1 flex-row gap-3">
            <FileText color="#9CA3AF" size={20} style={{ marginTop: 2 }} />
            <TextInput
              className="flex-1 text-gray-700 text-base"
              value={description}
              onChangeText={setDescription}
              placeholder="¿Qué servicio realizaste?"
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={MAX_DESCRIPTION}
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
            />
          </View>
          <Text className="text-xs text-gray-400 text-right mb-5">
            {description.length}/{MAX_DESCRIPTION}
          </Text>

          {/* 4. Evidence */}
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
              <FileText color="#9CA3AF" size={32} />
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-3">
                {isEditing ? 'Reemplazar Evidencia (PDF, opcional)' : 'Subir Evidencia (PDF, máx. 10 MB)'}
              </Text>
            </Pressable>
          )}

          {/* Submit */}
          <Pressable
            className="bg-[#002d4e] rounded-2xl py-5 flex-row items-center justify-center gap-3 active:opacity-80 mb-4"
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base uppercase tracking-wider">
                {isEditing ? 'Guardar Cambios' : 'Enviar Reporte'}
              </Text>
            )}
          </Pressable>

          <Text className="text-center text-xs text-gray-400 tracking-widest uppercase">
            Horas de Servicio • Funval Internacional
          </Text>
        </KeyboardAwareScrollView>
      )}
    </View>
  );
}
