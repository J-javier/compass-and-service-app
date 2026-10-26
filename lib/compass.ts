import { CompassCategoryResponse, CompassGoalResponse, CompassPlanStatusId } from '@/types/api';

/** Only the first 5 plan years count toward the 100% progress. */
export const PLAN_WINDOW_YEARS = 5;
export const PLAN_STATUS = { PENDING: 1, APPROVED: 2, REJECTED: 3 } as const;

export const PLAN_STATUS_META: Record<CompassPlanStatusId, { label: string; bg: string; text: string }> = {
  1: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
  2: { label: 'Aprobado', bg: 'bg-green-100', text: 'text-green-700' },
  3: { label: 'Rechazado', bg: 'bg-red-100', text: 'text-red-700' },
};

export function planYears(startYear: number): number[] {
  return Array.from({ length: PLAN_WINDOW_YEARS }, (_, i) => startYear + i);
}

export const goalKey = (subcategoryId: number, year: number) => `${subcategoryId}:${year}`;

export function indexGoals(goals: CompassGoalResponse[]): Map<string, CompassGoalResponse> {
  return new Map(goals.map((g) => [goalKey(g.subcategory_id, g.year), g]));
}

export interface CategoryProgress {
  completed: number;
  total: number;
}

/**
 * Per-category "{completed}/{total}" counter: goals the student has for that
 * category's subcategories inside the first 5 plan years.
 */
export function categoryProgress(
  category: CompassCategoryResponse,
  goals: CompassGoalResponse[],
  startYear: number,
): CategoryProgress {
  const subIds = new Set(category.subcategories.map((s) => s.id));
  const endYear = startYear + PLAN_WINDOW_YEARS - 1;
  const completed = goals.filter(
    (g) => subIds.has(g.subcategory_id) && g.year >= startYear && g.year <= endYear && g.goal.trim() !== '',
  ).length;
  return { completed, total: category.subcategories.length * PLAN_WINDOW_YEARS };
}
