import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Info, Lightbulb } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardGoals from '@/components/CardGoals';
import GoalGuideModal from '@/components/GoalGuideModal';
import { getAreaStyle } from '@/constants/areas';
import { SUBCATEGORY_GUIDES, getRoleIntro } from '@/constants/goalGuides';
import { useCompass } from '@/hooks/useCompass';
import { useGoalAutosave } from '@/hooks/useGoalAutosave';
import { goalKey, indexGoals, planYears } from '@/lib/compass';
import { CompassSubcategoryResponse } from '@/types/api';

export default function EditarMetas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categoryId: categoryParam } = useLocalSearchParams<{ categoryId?: string }>();
  const { plan, categories, goals, loading, createGoal, updateGoal, deleteGoal } = useCompass();

  const [categoryId, setCategoryId] = useState<number | null>(categoryParam ? Number(categoryParam) : null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [guideFor, setGuideFor] = useState<CompassSubcategoryResponse | null>(null);

  const goalsIndex = useMemo(() => indexGoals(goals), [goals]);
  const findGoal = useCallback(
    (subId: number, year: number) => goalsIndex.get(goalKey(subId, year)),
    [goalsIndex],
  );
  const autosave = useGoalAutosave({ findGoal, createGoal, updateGoal, deleteGoal });

  const years = plan ? planYears(plan.start_year) : [];
  const category = categories.find((c) => c.id === categoryId) ?? categories[0];
  const style = getAreaStyle(category?.name ?? '');
  const IconComp = style.icon;
  const roleIntro = category ? getRoleIntro(category.name) : undefined;
  const hasVision = !!plan?.vision?.trim();

  // Default to the current year when it's inside the plan, else the first plan year
  useEffect(() => {
    if (!plan || selectedYear != null) return;
    const current = new Date().getFullYear();
    const ys = planYears(plan.start_year);
    setSelectedYear(ys.includes(current) ? current : ys[0]);
  }, [plan, selectedYear]);

  // Switching year/category/screen flushes pending debounces immediately so
  // no typed text is lost; drafts are keyed per (subcategory, year) anyway.
  const changeYear = (year: number) => {
    autosave.flushAll();
    setSelectedYear(year);
  };
  const changeCategory = (id: number) => {
    autosave.flushAll();
    setCategoryId(id);
  };
  const goBack = async () => {
    await autosave.flushAll();
    router.back();
  };

  const year = selectedYear ?? years[0];

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <Pressable className="flex-row items-center gap-1 active:opacity-70" onPress={goBack}>
          <ChevronLeft color="#3B82F6" size={20} />
          <Text className="text-blue-500 font-medium">Volver</Text>
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-gray-900">Editar Metas</Text>
        <View style={{ width: 64 }} />
      </View>

      {loading && !category ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002d4e" />
        </View>
      ) : !plan || !category || year == null ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-500 text-center">No se encontró tu plan de Brújula de Vida.</Text>
        </View>
      ) : (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Quick category switch — local state only, no reload */}
          <View className="flex-row justify-between mb-4">
            {categories.map((c) => {
              const s = getAreaStyle(c.name);
              const QuickIcon = s.icon;
              const active = c.id === category.id;
              return (
                <Pressable
                  key={c.id}
                  className="w-12 h-12 rounded-full items-center justify-center active:opacity-70"
                  style={{
                    backgroundColor: active ? s.accentColor : s.iconBg,
                    borderWidth: active ? 0 : 1,
                    borderColor: '#E5E7EB',
                  }}
                  onPress={() => changeCategory(c.id)}
                  accessibilityLabel={c.name}
                >
                  <QuickIcon color={active ? '#fff' : s.iconColor} size={20} />
                </Pressable>
              );
            })}
          </View>

          {/* Area card */}
          <View className="rounded-2xl p-5 flex-row items-center gap-4 mb-4" style={{ backgroundColor: style.accentColor }}>
            <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
              <IconComp color="#fff" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{category.name}</Text>
              <Text className="text-sm" style={{ color: style.subtitleColor }}>
                Planificación Quinquenal {plan.start_year} - {plan.start_year + 4}
              </Text>
            </View>
          </View>

          {roleIntro ? (
            <View className="flex-row items-start gap-3 bg-white rounded-2xl p-4 mb-5 border border-gray-100">
              <Lightbulb color={style.accentColor} size={18} style={{ marginTop: 1 }} />
              <Text className="flex-1 text-xs text-gray-600 leading-5">{roleIntro}</Text>
            </View>
          ) : null}

          {!hasVision ? (
            <View className="flex-row items-start gap-3 bg-amber-50 rounded-2xl p-4 mb-5">
              <Info color="#D97706" size={16} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs text-amber-700 leading-5">
                Primero guarda tu visión personal en la pantalla de Brújula para poder cargar metas.
              </Text>
            </View>
          ) : null}

          {/* Year tabs */}
          <View className="flex-row bg-gray-200 rounded-2xl p-1 mb-6">
            {years.map((y) => (
              <Pressable
                key={y}
                className={`flex-1 py-2 rounded-xl items-center active:opacity-70 ${year === y ? 'bg-white' : ''}`}
                onPress={() => changeYear(y)}
              >
                <Text className={`text-sm font-semibold ${year === y ? 'text-gray-900' : 'text-gray-500'}`}>{y}</Text>
              </Pressable>
            ))}
          </View>

          {/* One autosaved field per subcategory for the active year */}
          <View className="gap-4 mb-5">
            {category.subcategories.map((sub) => (
              <CardGoals
                key={`${sub.id}-${year}`}
                title={sub.name}
                value={autosave.getValue(sub.id, year)}
                onChangeText={(t) => autosave.setValue(sub.id, year, t)}
                areaAccentColor={style.accentColor}
                selectedYear={year}
                status={autosave.getStatus(sub.id, year)}
                errorMessage={autosave.getError(sub.id, year)}
                onHelp={() => setGuideFor(sub)}
                editable={hasVision}
              />
            ))}
          </View>

          <View className="flex-row items-start gap-3 bg-blue-50 rounded-2xl p-4">
            <Lightbulb color="#3B82F6" size={18} style={{ marginTop: 1 }} />
            <Text className="flex-1 text-xs text-blue-600 leading-5">
              <Text className="font-bold">Consejo: </Text>
              Tus metas se guardan solas mientras escribes. Sé específico: en lugar de &quot;Leer más&quot;, intenta
              &quot;Leer 10 páginas diarias&quot;.
            </Text>
          </View>
        </KeyboardAwareScrollView>
      )}

      <GoalGuideModal
        visible={guideFor != null}
        title={guideFor?.name ?? ''}
        guide={guideFor ? SUBCATEGORY_GUIDES[guideFor.code] : undefined}
        accentColor={style.accentColor}
        onClose={() => setGuideFor(null)}
      />
    </View>
  );
}
