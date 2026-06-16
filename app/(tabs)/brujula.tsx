import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { Sparkles, Printer, PenLine, Info } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardAreasBrujula from '@/components/CardAreasBrujula';
import Header from '@/components/Header';
import { AREAS } from '@/constants/areas';
import { useAuth } from '@/context/AuthContext';
import { useCompass } from '@/hooks/useCompass';

export default function Brujula() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile, goals, loading, updateProfile, createProfile, refetchGoals, exportCompass } = useCompass();
  const [exporting, setExporting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetchGoals();
    }, [refetchGoals])
  );

  const [isEditingVision, setIsEditingVision] = useState(false);
  const [vision, setVision] = useState('');
  const [visionDraft, setVisionDraft] = useState('');
  const [saving, setSaving] = useState(false);

  // Seed local vision state when profile loads
  useEffect(() => {
    if (profile?.vision != null) {
      setVision(profile.vision);
      setVisionDraft(profile.vision);
    }
  }, [profile?.vision]);

  const handleStartEditVision = () => {
    setVisionDraft(vision);
    setIsEditingVision(true);
  };

  const handleCancelEditVision = () => {
    setVisionDraft(vision);
    setIsEditingVision(false);
  };

  const handleSaveVision = async () => {
    const trimmed = visionDraft.trim();
    if (!trimmed) {
      setIsEditingVision(false);
      return;
    }
    setSaving(true);
    try {
      if (profile) {
        await updateProfile({ vision: trimmed });
      } else {
        await createProfile({ start_year: new Date().getFullYear(), vision: trimmed });
      }
      setVision(trimmed);
      setIsEditingVision(false);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'No se pudo guardar la visión. Intenta de nuevo.';
      Alert.alert('Error', typeof msg === 'string' ? msg : 'No se pudo guardar la visión.');
    } finally {
      setSaving(false);
    }
  };

  // Derive area completion status and progress from the API goals tree
  const areasWithStatus = AREAS.map((area) => {
    const apiCategory = goals?.categories.find((c) => c.id === area.id);
    const yearsCount = goals?.years.length ?? 5;
    const subCount = apiCategory?.subcategories.length ?? area.goals.length;
    const totalCount = subCount * yearsCount;
    const filledCount = apiCategory
      ? apiCategory.subcategories.reduce((sum, sub) => sum + sub.goals.length, 0)
      : 0;
    return {
      ...area,
      status: filledCount === totalCount ? ('COMPLETO' as const) : ('PENDIENTE' as const),
      filledCount,
      totalCount,
    };
  });

  const completedCount = areasWithStatus.filter((a) => a.status === 'COMPLETO').length;
  const allComplete = completedCount === AREAS.length;

  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?';

  const headerUser = {
    initials,
    name: user?.full_name ?? '—',
    role: user?.role ?? '—',
    plan: profile ? `${profile.start_year} - ${profile.start_year + 4}` : '',
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <Header user={headerUser} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002d4e" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Visión Personal */}
          <View
            className="bg-white rounded-2xl p-5 mb-5"
            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Sparkles color="#F59E0B" size={20} />
                <Text className="text-base font-bold text-gray-900">Mi Visión Personal</Text>
              </View>

              {!isEditingVision ? (
                <Pressable className="active:opacity-70" onPress={handleStartEditVision}>
                  <PenLine color="#9CA3AF" size={18} />
                </Pressable>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Pressable
                    className="px-3 py-1.5 rounded-lg bg-gray-100 active:opacity-70"
                    onPress={handleCancelEditVision}
                    disabled={saving}
                  >
                    <Text className="text-xs font-semibold text-gray-600">Cancelar</Text>
                  </Pressable>
                  <Pressable
                    className="px-3 py-1.5 rounded-lg bg-blue-500 active:opacity-70"
                    onPress={handleSaveVision}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-xs font-semibold text-white">Guardar</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            <TextInput
              className={`text-sm leading-6 ${isEditingVision ? 'text-gray-800' : 'text-gray-600 italic'}`}
              value={isEditingVision ? visionDraft : vision}
              onChangeText={setVisionDraft}
              editable={isEditingVision}
              multiline
              textAlignVertical="top"
              placeholder="Escribe tu visión personal..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Áreas de la Brújula */}
          <View className="gap-3 mb-5">
            {areasWithStatus.map((area) => (
              <CardAreasBrujula
                key={area.id}
                area={area}
                onPress={!profile ? () => Alert.alert(
                  'Perfil requerido',
                  'Primero guarda tu visión personal para poder editar las metas.'
                ) : undefined}
              />
            ))}
          </View>

          {!allComplete && (
            <View className="flex-row items-start gap-3 bg-blue-50 rounded-2xl p-4 mb-5">
              <Info color="#3B82F6" size={16} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs text-blue-600 leading-5">
                Debes completar las metas de todas las áreas para poder desbloquear la opción de imprimir tu
                Brújula de Vida.
              </Text>
            </View>
          )}

          <Pressable
            className={`flex-row items-center justify-center gap-3 p-4 rounded-2xl ${allComplete && !exporting ? 'bg-[#002d4e] active:opacity-70' : 'bg-gray-200'}`}
            disabled={!allComplete || exporting}
            onPress={async () => {
              setExporting(true);
              try {
                await exportCompass();
              } catch (e: any) {
                const msg = e?.message ?? 'No se pudo exportar la brújula. Intenta de nuevo.';
                Alert.alert('Error', msg);
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Printer color={allComplete ? '#fff' : '#9CA3AF'} size={20} />
            )}
            <Text className={`font-semibold text-base ${allComplete && !exporting ? 'text-white' : 'text-gray-400'}`}>
              {exporting ? 'Exportando...' : 'Imprimir Brújula'}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
