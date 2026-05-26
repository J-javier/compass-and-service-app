import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { CountryCreate, CountryResponse, CountryUpdate } from '@/types/api';

export function useCountries() {
  const [data, setData] = useState<CountryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CountryResponse[]>('/countries/');
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar países');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const getCountry = useCallback(async (id: number) => {
    const res = await api.get<CountryResponse>(`/countries/${id}`);
    return res.data;
  }, []);

  const createCountry = useCallback(async (body: CountryCreate) => {
    const res = await api.post<CountryResponse>('/countries/', body);
    setData((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateCountry = useCallback(async (id: number, body: CountryUpdate) => {
    const res = await api.patch<CountryResponse>(`/countries/${id}`, body);
    setData((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res.data;
  }, []);

  const deleteCountry = useCallback(async (id: number) => {
    await api.delete(`/countries/${id}`);
    setData((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { data, loading, error, refetch, getCountry, createCountry, updateCountry, deleteCountry };
}
