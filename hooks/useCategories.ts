import { useCallback, useEffect, useState } from 'react';
import sigefApi from '@/services/sigefApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { unwrapData } from '@/lib/apiData';
import { ServiceCategoryResponse } from '@/types/api';

export function useCategories() {
  const [data, setData] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sigefApi.get('/api/students/service-reports/categories');
      setData(unwrapData<ServiceCategoryResponse[]>(res.data));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Error al cargar categorías'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
