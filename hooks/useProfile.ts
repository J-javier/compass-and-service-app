import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { PasswordUpdate, UserResponse, UserUpdate } from '@/types/api';

export function useProfile() {
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<UserResponse>('/profile/me');
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const updateProfile = useCallback(async (updates: UserUpdate) => {
    const res = await api.patch<UserResponse>('/profile/me', updates);
    setData(res.data);
    return res.data;
  }, []);

  const updatePassword = useCallback(async (body: PasswordUpdate) => {
    await api.patch('/profile/password', body);
  }, []);

  return { data, loading, error, refetch, updateProfile, updatePassword };
}
