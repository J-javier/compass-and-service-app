import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import {
  CompassProfileCreate,
  CompassProfileUpdate,
  CompassProfileWithProgressResponse,
  GoalCategoryResponse,
  GoalCreate,
  GoalResponse,
  GoalUpdate,
  GoalsTreeResponse,
} from '@/types/api';

export function useCompass() {
  const [profile, setProfile] = useState<CompassProfileWithProgressResponse | null>(null);
  const [goals, setGoals] = useState<GoalsTreeResponse | null>(null);
  const [categories, setCategories] = useState<GoalCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, goalsRes, catsRes] = await Promise.all([
        api.get<CompassProfileWithProgressResponse>('/compass/profile'),
        api.get<GoalsTreeResponse>('/compass/goals'),
        api.get<GoalCategoryResponse[]>('/compass/categories'),
      ]);
      setProfile(profileRes.data);
      setGoals(goalsRes.data);
      setCategories(catsRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar brújula');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createProfile = useCallback(async (body: CompassProfileCreate) => {
    const res = await api.post<CompassProfileWithProgressResponse>('/compass/profile', body);
    setProfile(res.data);
    return res.data;
  }, []);

  const updateProfile = useCallback(async (body: CompassProfileUpdate) => {
    const res = await api.put<CompassProfileWithProgressResponse>('/compass/profile', body);
    setProfile(res.data);
    return res.data;
  }, []);

  const createGoal = useCallback(async (body: GoalCreate) => {
    const res = await api.post<GoalResponse>('/compass/goals', body);
    // Refetch to keep the full tree in sync
    const goalsRes = await api.get<GoalsTreeResponse>('/compass/goals');
    setGoals(goalsRes.data);
    return res.data;
  }, []);

  const updateGoal = useCallback(async (id: number, body: GoalUpdate) => {
    const res = await api.put<GoalResponse>(`/compass/goals/${id}`, body);
    const goalsRes = await api.get<GoalsTreeResponse>('/compass/goals');
    setGoals(goalsRes.data);
    return res.data;
  }, []);

  const deleteGoal = useCallback(async (id: number) => {
    await api.delete(`/compass/goals/${id}`);
    const goalsRes = await api.get<GoalsTreeResponse>('/compass/goals');
    setGoals(goalsRes.data);
  }, []);

  const refetchGoals = useCallback(async () => {
    const goalsRes = await api.get<GoalsTreeResponse>('/compass/goals');
    setGoals(goalsRes.data);
  }, []);

  const exportCompass = useCallback(async () => {
    const res = await api.get('/compass/export', { responseType: 'blob' });
    return res.data;
  }, []);

  return {
    profile,
    goals,
    categories,
    loading,
    error,
    refetch,
    refetchGoals,
    createProfile,
    updateProfile,
    createGoal,
    updateGoal,
    deleteGoal,
    exportCompass,
  };
}
