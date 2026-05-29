import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { AdminDashboardStats, StudentDashboardStats } from '@/types/api';

export type DashboardStats = StudentDashboardStats | AdminDashboardStats;

export function useDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardStats>('/dashboard/stats');
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
