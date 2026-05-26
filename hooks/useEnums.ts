import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';

export function useEnums() {
  const [roles, setRoles] = useState<string[]>([]);
  const [reportStatuses, setReportStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, statusesRes] = await Promise.all([
        api.get<string[]>('/enums/roles'),
        api.get<string[]>('/enums/report-statuses'),
      ]);
      setRoles(rolesRes.data);
      setReportStatuses(statusesRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar enums');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { roles, reportStatuses, loading, error, refetch };
}
