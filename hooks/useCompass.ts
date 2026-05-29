import { useCallback, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/constants/config';
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
      const [profileResult, goalsResult, catsResult] = await Promise.allSettled([
        api.get<CompassProfileWithProgressResponse>('/compass/profile'),
        api.get<GoalsTreeResponse>('/compass/goals'),
        api.get<GoalCategoryResponse[]>('/compass/categories'),
      ]);

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value.data);
      }
      // 404 en profile = usuario nuevo sin perfil, estado válido → no setError

      if (goalsResult.status === 'fulfilled') {
        setGoals(goalsResult.value.data);
      }

      if (catsResult.status === 'fulfilled') {
        setCategories(catsResult.value.data);
      }
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
    try {
      const goalsRes = await api.get<GoalsTreeResponse>('/compass/goals');
      setGoals(goalsRes.data);
    } catch {}
  }, []);

  const exportCompass = useCallback(async () => {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    const localUri = FileSystem.cacheDirectory + 'brujula.pdf';
    const result = await FileSystem.downloadAsync(
      `${API_BASE_URL}/api/v1/compass/export`,
      localUri,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (result.status !== 200) {
      const errorBody = await FileSystem.readAsStringAsync(result.uri).catch(() => '');
      let detail = `Error ${result.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        detail = parsed?.detail ?? parsed?.message ?? detail;
      } catch {}
      throw new Error(detail);
    }
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartir Brújula de Vida',
    });
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
