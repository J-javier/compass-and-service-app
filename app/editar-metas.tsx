import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, Info, Lightbulb } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardGoals from '@/components/CardGoals';
import GoalGuideModal from '@/components/GoalGuideModal';
import ProgressRing from '@/components/ui/ProgressRing';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { getAreaStyle } from '@/constants/areas';
import { COLORS } from '@/constants/theme';
import { SUBCATEGORY_GUIDES, getRoleIntro } from '@/constants/goalGuides';
import { useCompass } from '@/hooks/useCompass';
import { useGoalAutosave } from '@/hooks/useGoalAutosave';
import { categoryProgress, goalKey, indexGoals, planYears } from '@/lib/compass';

type Guide = { title: string; description?: string; examples?: string[] };

/**
 * Goal editor for one area: area switch, year tabs and one autosaved field per
 * subcategory. Walks the plan year by year, then on to the next area.
 */
export default function EditarMetas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categoryId: categoryParam, year: yearParam } = useLocalSearchParams<{ categoryId?: string; year?: string }>();
  const { plan, categories, goals, loading, createGoal, updateGoal, deleteGoal } = useCompass();
  const scrollRef = useRef<ScrollView>(null);

  const [categoryId, setCategoryId] = useState<number | null>(categoryParam ? Number(categoryParam) : null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);

  const goalsIndex = useMemo(() => indexGoals(goals), [goals]);
  /** Saved goal for a (subcategory, year) slot, if any. */
  const findGoal = useCallback(
    (subId: number, year: number) => goalsIndex.get(goalKey(subId, year)),
    [goalsIndex],
  );
  const autosave = useGoalAutosave({ findGoal, createGoal, updateGoal, deleteGoal });

  const years = plan ? planYears(plan.start_year) : [];
  const categoryIndex = Math.max(0, categories.findIndex((c) => c.id === categoryId));
  const category = categories[categoryIndex];
  const nextCategory = categories[categoryIndex + 1];
  const style = getAreaStyle(category?.name ?? '');
  const hasVision = !!plan?.vision?.trim();

  /** Like the web editor, starts on the plan's first year (unless a link asks for a specific one). */
  useEffect(() => {
    if (!plan || selectedYear != null) return;
    const requested = Number(yearParam);
    setSelectedYear(planYears(plan.start_year).includes(requested) ? requested : plan.start_year);
  }, [plan, selectedYear, yearParam]);

  /** Scrolls back to the top after switching year or area. */
  const scrollTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  /**
   * Switches the visible year. Pending debounces are flushed first so no typed
   * text is lost (drafts are keyed per subcategory and year anyway).
   */
  const changeYear = (year: number) => {
    autosave.flushAll();
    setSelectedYear(year);
    scrollTop();
  };
  /** Switches the area (flushing pending saves) and goes back to the plan's first year. */
  const changeCategory = (id: number) => {
    autosave.flushAll();
    setCategoryId(id);
    if (plan) setSelectedYear(plan.start_year);
    scrollTop();
  };
  /** Waits for pending saves before leaving the screen. */
  const goBack = async () => {
    await autosave.flushAll();
    router.back();
  };

  const year = selectedYear ?? years[0];

  if (loading && !category) {
    return (
      <View className="flex-1 bg-paper">
        <ScreenHeader title="Editar metas" onBack={goBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.navy} />
        </View>
      </View>
    );
  }
  if (!plan || !category || year == null) {
    return (
      <View className="flex-1 bg-paper">
        <ScreenHeader title="Editar metas" onBack={goBack} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-body text-muted">No se encontró tu plan de Brújula de Vida.</Text>
        </View>
      </View>
    );
  }

  const progress = categoryProgress(category, goals, plan.start_year);
  const yearIndex = years.indexOf(year);
  const previousYear = years[yearIndex - 1];
  const nextYear = years[yearIndex + 1];
  const roleIntro = getRoleIntro(category.name);

  return (
    <View className="flex-1 bg-paper">
      <ScreenHeader
        title={category.name}
        subtitle={`${progress.completed} de ${progress.total} metas · ${plan.start_year}–${plan.start_year + 4}`}
        background={style.accentColor}
        onBack={goBack}
        right={
          roleIntro ? (
            <Pressable
              className="h-11 w-11 items-center justify-center active:opacity-60"
              onPress={() => setGuide({ title: `Mi rol ${category.name.toLowerCase()}`, description: roleIntro })}
              accessibilityLabel={`Guía del rol ${category.name}`}
            >
              <Lightbulb color={COLORS.white} size={22} />
            </Pressable>
          ) : undefined
        }
      />

      <KeyboardAwareScrollView
        ref={scrollRef as any}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
      >
        {/*
          Area switch — every area visible at once (no sideways scrolling), as in
          the web's "Ir a otra área": icon inside a progress ring, ✓ when complete,
          full name below. Local state only, no reload.
        */}
        <View className="mb-5 flex-row justify-between">
          {categories.map((c) => {
            const s = getAreaStyle(c.name);
            const AreaIcon = s.icon;
            const active = c.id === category.id;
            const p = categoryProgress(c, goals, plan.start_year);
            const complete = p.total > 0 && p.completed >= p.total;
            return (
              <Pressable
                key={c.id}
                className="flex-1 items-center gap-1.5 py-1 active:opacity-70"
                onPress={() => changeCategory(c.id)}
                disabled={active}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${c.name}, ${p.completed} de ${p.total} metas`}
              >
                <View>
                  <ProgressRing percent={p.total ? (p.completed / p.total) * 100 : 0} size={50} strokeWidth={3.5} color={s.accentColor} trackColor="#E4E9F0">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: active ? s.accentColor : s.iconBg }}
                    >
                      <AreaIcon color={active ? COLORS.white : s.iconColor} size={19} />
                    </View>
                  </ProgressRing>
                  {complete ? (
                    <View className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-600">
                      <Check color={COLORS.white} size={11} strokeWidth={3} />
                    </View>
                  ) : null}
                </View>
                <Text
                  className={`text-caption ${active ? 'font-bold' : 'text-muted'}`}
                  style={active ? { color: s.accentColor } : undefined}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Year tabs */}
        <View className="mb-5 flex-row rounded-2xl bg-gray-200 p-1">
          {years.map((y) => {
            const active = year === y;
            return (
              <Pressable
                key={y}
                className={`flex-1 items-center rounded-xl py-2.5 active:opacity-70 ${active ? 'bg-white' : ''}`}
                onPress={() => changeYear(y)}
              >
                <Text className="text-label font-semibold" style={{ color: active ? style.accentColor : COLORS.muted }}>{y}</Text>
              </Pressable>
            );
          })}
        </View>

        {!hasVision ? (
          <View className="mb-5 flex-row items-start gap-3 rounded-2xl bg-amber-50 p-4">
            <Info color="#D97706" size={16} style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-label text-amber-800">Primero escribe tu visión personal para poder cargar metas.</Text>
              <Pressable onPress={() => router.push('/configurar-plan?mode=edit')} hitSlop={8}>
                <Text className="mt-1 text-label font-semibold text-amber-800">Escribir mi visión →</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* One autosaved field per subcategory for the active year */}
        <View className="mb-6 gap-4">
          {category.subcategories.map((sub) => {
            const subGuide = SUBCATEGORY_GUIDES[sub.code];
            return (
              <CardGoals
                key={`${sub.id}-${year}`}
                title={sub.name}
                value={autosave.getValue(sub.id, year)}
                onChangeText={(t) => autosave.setValue(sub.id, year, t)}
                areaAccentColor={style.accentColor}
                selectedYear={year}
                status={autosave.getStatus(sub.id, year)}
                errorMessage={autosave.getError(sub.id, year)}
                onRetry={() => autosave.retry(sub.id, year)}
                onHelp={
                  subGuide
                    ? () => setGuide({ title: sub.name, description: subGuide.description, examples: subGuide.examples })
                    : undefined
                }
                editable={hasVision}
              />
            );
          })}
        </View>

        {/* Walk the plan year by year, then on to the next area */}
        <View className="flex-row items-center justify-between border-t border-gray-200 pt-4">
          {previousYear !== undefined ? (
            <Pressable className="flex-row items-center gap-1 px-2 py-3 active:opacity-60" onPress={() => changeYear(previousYear)}>
              <ArrowLeft color={COLORS.muted} size={16} />
              <Text className="text-body font-semibold text-muted">{previousYear}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {nextYear !== undefined ? (
            <Pressable
              className="flex-row items-center gap-1.5 rounded-2xl px-5 py-3.5 active:opacity-80"
              style={{ backgroundColor: style.accentColor }}
              onPress={() => changeYear(nextYear)}
            >
              <Text className="text-body font-bold text-white">Siguiente: {nextYear}</Text>
              <ArrowRight color={COLORS.white} size={16} />
            </Pressable>
          ) : nextCategory ? (
            <Pressable
              className="flex-row items-center gap-1.5 rounded-2xl px-5 py-3.5 active:opacity-80"
              style={{ backgroundColor: getAreaStyle(nextCategory.name).accentColor }}
              onPress={() => changeCategory(nextCategory.id)}
            >
              <Text className="text-body font-bold text-white">Continuar con {nextCategory.name}</Text>
              <ArrowRight color={COLORS.white} size={16} />
            </Pressable>
          ) : (
            <Pressable className="rounded-2xl bg-navy px-5 py-3.5 active:opacity-80" onPress={goBack}>
              <Text className="text-body font-bold text-white">Volver a la Brújula</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAwareScrollView>

      <GoalGuideModal
        visible={guide != null}
        title={guide?.title ?? ''}
        description={guide?.description}
        examples={guide?.examples}
        area={style}
        onClose={() => setGuide(null)}
      />
    </View>
  );
}
