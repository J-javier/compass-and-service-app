import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lightbulb, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AREAS } from '@/constants/areas';
import { useCompass } from '@/hooks/useCompass';
import api from '@/services/api';
import CardGoals from '@/components/CardGoals';

export default function EditarMetas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { areaId } = useLocalSearchParams<{ areaId: string }>();
  const { goals, categories, profile, loading, refetchGoals } = useCompass();

  const area = AREAS.find((a) => a.id === Number(areaId)) ?? AREAS[0];
  const IconComp = area.icon;

  const startYear = goals?.start_year ?? profile?.start_year ?? new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => startYear + i);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // values[year][localGoalIndex] = text
  const [values, setValues] = useState<Record<number, Record<number, string>>>({});
  const [saving, setSaving] = useState(false);

  // Sync selectedYear once the API years load
  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years]);

  // Find this area's data in the API goals tree
  const apiCategory = goals?.categories.find((c) => c.id === area.id);
  // Find API subcategory definitions for this area
  const apiCategoryDef = categories.find((c) => c.id === area.id);

  // Initialize values from existing API goals
  useEffect(() => {
    if (!apiCategory) return;
    const initialValues: Record<number, Record<number, string>> = {};
    years.forEach((year) => {
      initialValues[year] = {};
      apiCategory.subcategories.forEach((sub, idx) => {
        const existingGoal = sub.goals.find((g) => g.year === year);
        if (existingGoal) {
          initialValues[year][idx + 1] = existingGoal.goal;
        }
      });
    });
    setValues(initialValues);
  }, [goals]);

  const subcategories = apiCategoryDef?.subcategories ?? area.goals;
  const goalTemplates = subcategories.map((sub, idx) => ({
    id: sub.id,
    name: sub.name,
    placeholder: area.goals[idx]?.placeholder ?? 'Escribe tu meta para este enfoque...',
  }));

  const getValue = (goalIndex: number) => values[selectedYear]?.[goalIndex] ?? '';

  const setValue = (goalIndex: number, text: string) => {
    setValues((prev) => ({
      ...prev,
      [selectedYear]: { ...(prev[selectedYear] ?? {}), [goalIndex]: text },
    }));
  };

  const handleSave = async () => {
    if (!apiCategoryDef || !apiCategory) {
      Alert.alert('Error', 'No se pudo cargar la información de esta área');
      return;
    }
    setSaving(true);
    try {
      for (let idx = 0; idx < goalTemplates.length; idx++) {
        const localIndex = idx + 1;
        const text = (values[selectedYear]?.[localIndex] ?? '').trim();
        if (!text) continue;

        const sub = apiCategory.subcategories.find((s) => s.id === goalTemplates[idx].id);
        const existingGoal = sub?.goals.find((g) => g.year === selectedYear);

        if (existingGoal) {
          if (existingGoal.goal !== text) {
            await api.put(`/compass/goals/${existingGoal.id}`, { goal: text });
          }
        } else {
          await api.post('/compass/goals', { subcategory_id: goalTemplates[idx].id, year: selectedYear, goal: text });
        }
      }
      await refetchGoals();
      Alert.alert('Éxito', 'Metas guardadas correctamente');
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Error al guardar metas';
      Alert.alert('Error', typeof msg === 'string' ? msg : 'Error al guardar metas');
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
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <Pressable
          className="flex-row items-center gap-1 active:opacity-70"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#3B82F6" size={20} />
          <Text className="text-blue-500 font-medium">Volver</Text>
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-gray-900">Editar Metas</Text>
        <View style={{ width: 64 }} />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002d4e" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Area card */}
          <View
            className="rounded-2xl p-5 flex-row items-center gap-4 mb-5"
            style={{ backgroundColor: area.accentColor }}
          >
            <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
              <IconComp color="#fff" size={24} />
            </View>
            <View>
              <Text className="text-white text-xl font-bold">{area.name}</Text>
              <Text className="text-sm" style={{ color: area.subtitleColor }}>
                Planificación Quinquenal 2025 - 2029
              </Text>
            </View>
          </View>

          {/* Year selector */}
          <View className="flex-row bg-gray-200 rounded-2xl p-1 mb-6">
            {years.map((year) => (
              <Pressable
                key={year}
                className={`flex-1 py-2 rounded-xl items-center active:opacity-70 ${selectedYear === year ? 'bg-white' : ''}`}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  className={`text-sm font-semibold ${selectedYear === year ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  {year}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Goal cards */}
          <View className="gap-4 mb-5">
            {goalTemplates.map((goal, idx) => {
              const localIndex = idx + 1;
              return (
                <CardGoals
                  key={goal.id}
                  goal={goal}
                  value={getValue(localIndex)}
                  onChangeText={(t) => setValue(localIndex, t)}
                  areaAccentColor={area.accentColor}
                  selectedYear={selectedYear}
                />
              );
            })}
          </View>

          {/* Tip box */}
          <View className="flex-row items-start gap-3 bg-blue-50 rounded-2xl p-4 mb-6">
            <Lightbulb color="#3B82F6" size={18} style={{ marginTop: 1 }} />
            <Text className="flex-1 text-xs text-blue-600 leading-5">
              <Text className="font-bold">Consejo: </Text>
              Sé específico con tus metas. En lugar de &quot;Leer más&quot;, intenta &quot;Leer 10 páginas diarias&quot;.
            </Text>
          </View>

          {/* Save button */}
          <Pressable
            className="bg-[#002d4e] rounded-2xl py-5 flex-row items-center justify-center gap-3 active:opacity-80"
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save color="#fff" size={20} />
                <Text className="text-white font-bold text-base">Guardar Cambios</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      )}

      {/* Floating quick-area buttons */}
      <View className="absolute right-5 bottom-32 gap-3">
        {AREAS.filter((a) => a.id !== area.id).slice(0, 3).map((a) => {
          const QuickIcon = a.icon;
          return (
            <Pressable
              key={a.id}
              className="w-12 h-12 rounded-full items-center justify-center active:opacity-70"
              style={{
                backgroundColor: a.iconBg,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => router.replace(`/editar-metas?areaId=${a.id}`)}
            >
              <QuickIcon color={a.iconColor} size={20} />
            </Pressable>
          );
        })}
      </View>
    </KeyboardAvoidingView>
  );
}
