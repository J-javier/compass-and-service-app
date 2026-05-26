import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { CategoryCreate, CategoryResponse, CategoryUpdate } from '@/types/api';

export function useCategories() {
  const [data, setData] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CategoryResponse[]>('/categories/');
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createCategory = useCallback(async (body: CategoryCreate) => {
    const res = await api.post<CategoryResponse>('/categories/', body);
    setData((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateCategory = useCallback(async (id: number, body: CategoryUpdate) => {
    const res = await api.patch<CategoryResponse>(`/categories/${id}`, body);
    setData((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res.data;
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await api.delete(`/categories/${id}`);
    setData((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { data, loading, error, refetch, createCategory, updateCategory, deleteCategory };
}
