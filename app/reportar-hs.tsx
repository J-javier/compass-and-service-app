import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Check, ChevronDown, FileText, Minus, Plus, X } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import PhotoPreviewModal from '@/components/PhotoPreviewModal';
import PhotoSourceModal from '@/components/PhotoSourceModal';
import SelectModal from '@/components/SelectModal';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { COLORS } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { ReportEvidence, UploadFile, useReports } from '@/hooks/useReports';
import { getApiErrorCode, getApiErrorMessage, getApiFieldErrors } from '@/lib/apiError';
import { PhotoSource, pickEvidencePhoto } from '@/lib/evidencePhotos';
import { isReportEditable } from '@/lib/serviceReports';

const MAX_DESCRIPTION = 2000;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const QUICK_HOURS = [1, 2, 3, 4, 8];
/** Empty or a positive whole number without leading zeros (SIGEF: integer|min:1). */
const WHOLE_HOURS = /^([1-9]\d*)?$/;

type EvidenceMode = 'photos' | 'pdf';
type PhotoSlot = 'before' | 'during' | 'after';
const PHOTO_SLOTS: { key: PhotoSlot; label: string; field: string }[] = [
  { key: 'before', label: 'Antes', field: 'evidence_before' },
  { key: 'during', label: 'Durante', field: 'evidence_during' },
  { key: 'after', label: 'Después', field: 'evidence_after' },
];

/** Form field wrapper: label (with optional marker), control and inline error. */
function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-label font-semibold text-navy">
        {label}
        {optional ? <Text className="font-normal text-muted"> (opcional)</Text> : null}
      </Text>
      {children}
      {error ? <Text className="mt-1.5 text-caption text-red-600">{error}</Text> : null}
    </View>
  );
}

/**
 * Creates (or, with `?id=`, edits) a service hours report: activity type, whole
 * hours, optional description and evidence as three photos or one PDF.
 * Validation errors are shown inline next to each field.
 */
export default function ReportarHS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = id ? Number(id) : null;
  const isEditing = editingId != null && !Number.isNaN(editingId);

  const { getReport, createReport, updateReport } = useReports({ autoload: false });
  const { data: categories, loading: categoriesLoading } = useCategories();

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<EvidenceMode>('photos');
  const [photos, setPhotos] = useState<Partial<Record<PhotoSlot, UploadFile>>>({});
  const [busySlot, setBusySlot] = useState<PhotoSlot | null>(null);
  const [sourceFor, setSourceFor] = useState<{ slot: PhotoSlot; label: string } | null>(null);
  const [previewSlot, setPreviewSlot] = useState<{ slot: PhotoSlot; label: string } | null>(null);
  const [pdf, setPdf] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingReport, setLoadingReport] = useState(isEditing);

  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  /** Removes the inline errors of the given fields. */
  const clearError = (...fields: string[]) =>
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((f) => delete next[f]);
      return next;
    });

  /** Edit mode: preloads the report (only while it was never reviewed). */
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
        setCategoryId(report.category_id);
        setHours(String(Math.round(report.hours_spent)));
        setDescription(report.description ?? '');
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

  /** Adds or subtracts hours from the stepper, never below 1. */
  const stepHours = (delta: number) => {
    const next = Math.max(1, (parseInt(hours, 10) || 0) + delta);
    setHours(String(next));
    clearError('hours_spent');
  };

  /** Takes or picks one evidence photo and stores it in its slot. */
  const takePhoto = async (slot: PhotoSlot, label: string, source: PhotoSource) => {
    setBusySlot(slot);
    try {
      const file = await pickEvidencePhoto(source, `evidencia-${label.toLowerCase()}`);
      if (file) {
        setPhotos((prev) => ({ ...prev, [slot]: file }));
        clearError('evidence', `evidence_${slot}`);
      }
    } catch (e) {
      Alert.alert('Foto', e instanceof Error ? e.message : 'No se pudo obtener la foto');
    } finally {
      setBusySlot(null);
    }
  };

  /** Opens the camera-or-gallery chooser for a photo slot. */
  const choosePhotoSource = (slot: PhotoSlot, label: string) => setSourceFor({ slot, label });

  /**
   * Closes the chooser and opens the camera or gallery. The short delay lets the
   * modal finish closing before the system screen opens on top.
   */
  const handleSourceSelected = (source: PhotoSource) => {
    if (!sourceFor) return;
    const { slot, label } = sourceFor;
    setSourceFor(null);
    setTimeout(() => takePhoto(slot, label, source), 250);
  };

  /**
   * Picks the evidence PDF (max 10 MB). Android document providers unreliably
   * filter by MIME type, so the file extension is checked as well.
   */
  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const looksLikePdf = asset.mimeType === 'application/pdf' || asset.name.toLowerCase().endsWith('.pdf');
      if (!looksLikePdf) {
        setErrors((prev) => ({ ...prev, evidence: 'Debes seleccionar un archivo PDF.' }));
        return;
      }
      if (asset.size != null && asset.size > MAX_PDF_BYTES) {
        setErrors((prev) => ({ ...prev, evidence: 'El PDF no puede superar los 10 MB.' }));
        return;
      }
      setPdf(asset);
      clearError('evidence');
    } catch {
      setErrors((prev) => ({ ...prev, evidence: 'No se pudo seleccionar el archivo.' }));
    }
  };

  /** Evidence for the active mode only; never PDF and photos together. */
  const buildEvidence = (): ReportEvidence | undefined => {
    if (mode === 'pdf') {
      return pdf ? { kind: 'pdf', file: { uri: pdf.uri, name: pdf.name, type: pdf.mimeType ?? 'application/pdf' } } : undefined;
    }
    const { before, during, after } = photos;
    return before && during && after ? { kind: 'photos', before, during, after } : undefined;
  };

  /** Client-side validation; returns one message per invalid field. */
  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {};
    if (!categoryId) found.category_id = 'Selecciona el tipo de actividad.';
    if (!/^[1-9]\d*$/.test(hours)) found.hours_spent = 'Ingresa una cantidad de horas entera (mínimo 1).';
    const photoCount = PHOTO_SLOTS.filter((s) => photos[s.key]).length;
    if (mode === 'photos') {
      if ((!isEditing && photoCount < 3) || (isEditing && photoCount > 0 && photoCount < 3)) {
        const missing = PHOTO_SLOTS.filter((s) => !photos[s.key]).map((s) => s.label.toLowerCase());
        const list = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} y ${missing[missing.length - 1]}` : missing[0];
        found.evidence = missing.length > 1 ? `Faltan las fotos de ${list}.` : `Falta la foto de ${list}.`;
      }
    } else if (!isEditing && !pdf) {
      found.evidence = 'Adjunta el PDF de evidencia.';
    }
    return found;
  };

  /**
   * Validates and sends the report. Server 422 errors are mapped to their
   * fields; photo errors are shown under the evidence block.
   */
  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        category_id: categoryId!,
        hours_spent: parseInt(hours, 10),
        description: description.trim(),
        evidence: buildEvidence(),
      };
      if (isEditing) {
        await updateReport(editingId!, payload);
      } else {
        await createReport(payload);
      }
      Alert.alert(isEditing ? 'Reporte actualizado' : 'Reporte enviado', isEditing ? 'Guardamos tus cambios.' : 'Tu reporte quedó pendiente de revisión.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const fieldErrors = getApiFieldErrors(e);
      if (Object.keys(fieldErrors).length > 0) {
        const photoError = PHOTO_SLOTS.map((s) => fieldErrors[s.field]).find(Boolean);
        setErrors({ ...fieldErrors, ...(photoError && !fieldErrors.evidence ? { evidence: photoError } : {}) });
      } else if (getApiErrorCode(e) === 'report_not_editable') {
        Alert.alert('No editable', getApiErrorMessage(e), [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Error', getApiErrorMessage(e, 'No se pudo enviar el reporte.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={isEditing ? 'Editar reporte' : 'Nuevo reporte'} leading="close" />

      {loadingReport ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.navy} />
        </View>
      ) : (
        <>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bottomOffset={24}
            contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          >
            {isEditing ? (
              <Text className="mb-5 rounded-xl bg-blue-50 p-3 text-label text-blue-800">
                Puedes editar este reporte mientras no haya sido revisado.
              </Text>
            ) : null}

            <Field label="Tipo de actividad" error={errors.category_id}>
              <Pressable
                className="h-14 flex-row items-center justify-between rounded-2xl border bg-white px-4"
                style={{ borderColor: errors.category_id ? '#DC2626' : COLORS.line }}
                onPress={() => setCategoryPickerOpen(true)}
                disabled={categoriesLoading}
              >
                <Text className={`text-body ${selectedCategory ? 'text-ink' : 'text-muted'}`}>
                  {categoriesLoading ? 'Cargando…' : selectedCategory ? selectedCategory.name : 'Selecciona una opción'}
                </Text>
                <ChevronDown color={COLORS.faint} size={20} />
              </Pressable>
            </Field>
            <PhotoSourceModal label={sourceFor?.label ?? null} onSelect={handleSourceSelected} onClose={() => setSourceFor(null)} />
            <PhotoPreviewModal
              label={previewSlot?.label ?? null}
              uri={previewSlot ? (photos[previewSlot.slot]?.uri ?? null) : null}
              onClose={() => setPreviewSlot(null)}
              onRemove={() => {
                if (previewSlot) setPhotos((prev) => ({ ...prev, [previewSlot.slot]: undefined }));
                setPreviewSlot(null);
              }}
              onReplace={() => {
                const target = previewSlot;
                setPreviewSlot(null);
                // Let the preview finish closing before the chooser modal opens.
                if (target) setTimeout(() => choosePhotoSource(target.slot, target.label), 300);
              }}
            />
            <SelectModal
              visible={categoryPickerOpen}
              title="Tipo de actividad"
              subtitle="¿Qué tipo de servicio realizaste?"
              searchable
              options={categories.map((cat) => ({ value: cat.id, label: cat.name, description: cat.description }))}
              selectedValue={categoryId}
              onSelect={(value) => { setCategoryId(value); clearError('category_id'); }}
              onClose={() => setCategoryPickerOpen(false)}
            />

            <Field label="Cantidad de horas" error={errors.hours_spent}>
              <View className="flex-row items-center gap-3">
                <Pressable
                  className="h-14 w-14 items-center justify-center rounded-2xl border active:opacity-60"
                  style={{ borderColor: COLORS.line }}
                  onPress={() => stepHours(-1)}
                  accessibilityLabel="Restar una hora"
                >
                  <Minus color={COLORS.navy} size={20} />
                </Pressable>
                <View
                  className="h-14 flex-1 flex-row items-center justify-center rounded-2xl border px-4"
                  style={{ borderColor: errors.hours_spent ? '#DC2626' : COLORS.line }}
                >
                  <TextInput
                    className="min-w-[40px] text-center text-heading font-bold text-navy"
                    value={hours}
                    onChangeText={(t) => { if (WHOLE_HOURS.test(t)) { setHours(t); clearError('hours_spent'); } }}
                    placeholder="0"
                    placeholderTextColor={COLORS.faint}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Text className="ml-1 text-body text-muted">horas</Text>
                </View>
                <Pressable
                  className="h-14 w-14 items-center justify-center rounded-2xl border active:opacity-60"
                  style={{ borderColor: COLORS.line }}
                  onPress={() => stepHours(1)}
                  accessibilityLabel="Sumar una hora"
                >
                  <Plus color={COLORS.navy} size={20} />
                </Pressable>
              </View>
              <View className="mt-3 flex-row gap-2">
                {QUICK_HOURS.map((h) => {
                  const active = hours === String(h);
                  return (
                    <Pressable
                      key={h}
                      className="flex-1 items-center rounded-full border py-2 active:opacity-70"
                      style={active ? { backgroundColor: COLORS.brand, borderColor: COLORS.brand } : { borderColor: COLORS.line }}
                      onPress={() => { setHours(String(h)); clearError('hours_spent'); }}
                    >
                      <Text className="text-label font-semibold" style={{ color: active ? COLORS.white : '#33445A' }}>{h} h</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Descripción" optional error={errors.description}>
              <TextInput
                className="rounded-2xl border px-4 py-3 text-body text-ink"
                style={{ borderColor: COLORS.line, minHeight: 96 }}
                value={description}
                onChangeText={setDescription}
                placeholder="Agrega detalles que ayuden a validar tu reporte…"
                placeholderTextColor={COLORS.faint}
                multiline
                maxLength={MAX_DESCRIPTION}
                textAlignVertical="top"
              />
              <Text className="mt-1 text-right text-caption text-muted">{description.length}/{MAX_DESCRIPTION}</Text>
            </Field>

            <Field label={isEditing ? 'Reemplazar evidencia' : 'Evidencia'} optional={isEditing} error={errors.evidence}>
              <View className="mb-3 flex-row rounded-2xl bg-gray-100 p-1">
                {(['photos', 'pdf'] as const).map((m) => {
                  const active = mode === m;
                  const Icon = m === 'photos' ? Camera : FileText;
                  return (
                    <Pressable
                      key={m}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5 ${active ? 'bg-white' : ''}`}
                      onPress={() => { setMode(m); clearError('evidence'); }}
                    >
                      <Icon color={active ? COLORS.navy : COLORS.muted} size={16} />
                      <Text className="text-label font-semibold" style={{ color: active ? COLORS.navy : COLORS.muted }}>
                        {m === 'photos' ? 'Subir 3 fotos' : 'Ya tengo un PDF'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {mode === 'photos' ? (
                <>
                  <Text className="mb-3 text-label text-muted">
                    Una foto de antes, una durante y una después del servicio. Las convertimos en un PDF por ti.
                  </Text>
                  <View className="flex-row gap-3">
                    {PHOTO_SLOTS.map(({ key, label }) => {
                      const photo = photos[key];
                      return (
                        <View key={key} className="flex-1 items-center gap-1.5">
                          <Pressable
                            style={[
                              { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
                              photo
                                ? { borderWidth: 1.5, borderColor: COLORS.line, backgroundColor: COLORS.white }
                                : { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.brand, backgroundColor: '#F0F7FF' },
                            ]}
                            onPress={() => (photo ? setPreviewSlot({ slot: key, label }) : choosePhotoSource(key, label))}
                            disabled={busySlot != null}
                            accessibilityLabel={photo ? `Ver foto ${label}` : `Foto ${label}`}
                          >
                            {busySlot === key ? (
                              <ActivityIndicator color={COLORS.brand} />
                            ) : photo ? (
                              <>
                                {/* The tile needs a background/border (see style above): without them Android (Fabric) clips overflow-hidden children to nothing. */}
                                <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                                <View className="absolute right-1.5 top-1.5 h-5 w-5 items-center justify-center rounded-full bg-green-600">
                                  <Check color={COLORS.white} size={12} strokeWidth={3} />
                                </View>
                              </>
                            ) : (
                              <Camera color={COLORS.brand} size={24} />
                            )}
                          </Pressable>
                          <View className="flex-row items-center gap-1">
                            <Text className="text-caption font-semibold" style={{ color: photo ? COLORS.ink : COLORS.brand }}>{label}</Text>
                            {photo ? (
                              <Pressable hitSlop={8} onPress={() => setPhotos((prev) => ({ ...prev, [key]: undefined }))} accessibilityLabel={`Quitar foto ${label}`}>
                                <X color={COLORS.faint} size={14} />
                              </Pressable>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </>
              ) : pdf ? (
                <View className="flex-row items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: '#BFD8F6', backgroundColor: '#F0F7FF' }}>
                  <FileText color={COLORS.brand} size={20} />
                  <Text className="flex-1 text-body text-ink" numberOfLines={1}>{pdf.name}</Text>
                  <Pressable hitSlop={8} onPress={() => setPdf(null)} accessibilityLabel="Quitar PDF">
                    <X color={COLORS.faint} size={18} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  className="items-center justify-center rounded-2xl py-7 active:opacity-70"
                  style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.brand, backgroundColor: '#F0F7FF' }}
                  onPress={handlePickPdf}
                >
                  <FileText color={COLORS.brand} size={28} />
                  <Text className="mt-2 text-label font-semibold text-brand">Seleccionar PDF</Text>
                  <Text className="text-caption text-muted">PDF de hasta 10 MB</Text>
                </Pressable>
              )}
            </Field>
          </KeyboardAwareScrollView>

          <View className="border-t border-gray-100 px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
            <Pressable
              className="h-14 items-center justify-center rounded-2xl bg-navy active:opacity-80"
              onPress={handleSubmit}
              disabled={submitting || busySlot != null}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text className="text-body font-bold text-white">{isEditing ? 'Guardar cambios' : 'Enviar reporte'}</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
