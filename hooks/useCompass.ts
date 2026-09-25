import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import sigefApi from '@/services/sigefApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { unwrapData } from '@/lib/apiData';
import { PLAN_STATUS } from '@/lib/compass';
import { openAuthenticatedPdf } from '@/lib/downloadPdf';
import {
  CompassCategoryResponse,
  CompassGoalCreate,
  CompassGoalResponse,
  CompassPlanPayload,
  CompassPlanProgress,
  CompassPlanResponse,
  CompassPlanWithProgressResponse,
} from '@/types/api';

const BASE = '/api/students/compass';

const EMPTY_PROGRESS: CompassPlanProgress = {
  total_possible_slots: 55,
  filled_slots: 0,
  completion_rate: 0,
  years_with_goals: [],
};

/** POST/PATCH /plan may answer with the bare plan, {data: plan} or {plan, progress}. */
function extractPlan(body: any): CompassPlanResponse {
  if (body && typeof body === 'object' && 'plan' in body) return body.plan;
  return unwrapData<CompassPlanResponse>(body);
}

export function useCompass({ autoload = true }: { autoload?: boolean } = {}) {
  const [plan, setPlan] = useState<CompassPlanResponse | null>(null);
  const [progress, setProgress] = useState<CompassPlanProgress>(EMPTY_PROGRESS);
  const [categories, setCategories] = useState<CompassCategoryResponse[]>([]);
  const [goals, setGoals] = useState<CompassGoalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPlan = useCallback(async () => {
    const res = await sigefApi.get<CompassPlanWithProgressResponse>(`${BASE}/plan`);
    setPlan(res.data.plan ?? null);
    setProgress(res.data.progress ?? EMPTY_PROGRESS);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [planResult, goalsResult, catsResult] = await Promise.allSettled([
        sigefApi.get<CompassPlanWithProgressResponse>(`${BASE}/plan`),
        sigefApi.get(`${BASE}/goals`),
        sigefApi.get(`${BASE}/categories`),
      ]);

      if (planResult.status === 'fulfilled') {
        setPlan(planResult.value.data.plan ?? null);
        setProgress(planResult.value.data.progress ?? EMPTY_PROGRESS);
      } else if (isAxiosError(planResult.reason) && planResult.reason.response?.status === 404) {
        setPlan(null); // no plan yet — valid state
      } else {
        setError(getApiErrorMessage(planResult.reason, 'Error al cargar tu Brújula'));
      }

      if (goalsResult.status === 'fulfilled') {
        setGoals(unwrapData<CompassGoalResponse[]>(goalsResult.value.data) ?? []);
      } else {
        setGoals([]); // 404 not_found when there's no plan
      }

      if (catsResult.status === 'fulfilled') {
        setCategories(unwrapData<CompassCategoryResponse[]>(catsResult.value.data) ?? []);
      } else {
        setError(getApiErrorMessage(catsResult.reason, 'Error al cargar las categorías'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (autoload) refetch(); }, [autoload, refetch]);

  // Keeps filled_slots / completion_rate in sync after goal mutations
  // without blocking the autosave flow.
  const refreshProgressSilently = useCallback(() => {
    refreshPlan().catch(() => {});
  }, [refreshPlan]);

  const createPlan = useCallback(async (body: Required<CompassPlanPayload>) => {
    const res = await sigefApi.post(`${BASE}/plan`, body);
    const created = extractPlan(res.data);
    setPlan(created);
    refreshProgressSilently();
    return created;
  }, [refreshProgressSilently]);

  const updatePlan = useCallback(async (body: CompassPlanPayload) => {
    const res = await sigefApi.patch(`${BASE}/plan`, body);
    const updated = extractPlan(res.data);
    setPlan(updated);
    return updated;
  }, []);

  const createGoal = useCallback(async (body: CompassGoalCreate) => {
    const res = await sigefApi.post(`${BASE}/goals`, body);
    const created = unwrapData<CompassGoalResponse>(res.data);
    setGoals((prev) => [...prev, created]);
    refreshProgressSilently();
    return created;
  }, [refreshProgressSilently]);

  const updateGoal = useCallback(async (id: number, goal: string) => {
    const res = await sigefApi.patch(`${BASE}/goals/${id}`, { goal });
    const updated = unwrapData<CompassGoalResponse>(res.data);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    return updated;
  }, []);

  const deleteGoal = useCallback(async (id: number) => {
    await sigefApi.delete(`${BASE}/goals/${id}`);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    refreshProgressSilently();
  }, [refreshProgressSilently]);

  const canExport = plan?.status.id === PLAN_STATUS.APPROVED;

  const exportCompass = useCallback(async () => {
    if (!canExport) {
      throw new Error('Solo puedes exportar tu Brújula cuando el plan esté aprobado.');
    }
    await openAuthenticatedPdf(`${BASE}/export`, 'brujula-de-vida.pdf', 'Compartir Brújula de Vida');
  }, [canExport]);

  return {
    plan,
    progress,
    categories,
    goals,
    loading,
    error,
    canExport,
    refetch,
    createPlan,
    updatePlan,
    createGoal,
    updateGoal,
    deleteGoal,
    exportCompass,
  };
}
