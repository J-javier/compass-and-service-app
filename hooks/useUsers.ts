import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import {
  BulkUploadResult,
  StudentDebtListResponse,
  UserCreate,
  UserListResponse,
  UserResponse,
} from '@/types/api';

export function useUsers() {
  const [data, setData] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<UserListResponse>('/users/', {
        params: { page, page_size: pageSize },
      });
      setData(res.data.items);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createUser = useCallback(async (body: UserCreate) => {
    const res = await api.post<UserResponse>('/users/', body);
    setData((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const bulkCreate = useCallback(async (file: FormData) => {
    const res = await api.post<BulkUploadResult>('/users/bulk', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await refetch();
    return res.data;
  }, [refetch]);

  const listInDebt = useCallback(async (page = 1, pageSize = 20) => {
    const res = await api.get<StudentDebtListResponse>('/users/in-debt', {
      params: { page, page_size: pageSize },
    });
    return res.data;
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    await api.delete(`/users/${id}`);
    setData((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return { data, loading, error, refetch, createUser, bulkCreate, listInDebt, deleteUser };
}
