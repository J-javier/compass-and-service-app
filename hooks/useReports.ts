import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import {
  EvidenceResponse,
  ReportListResponse,
  ReportResponse,
  ReviewPayload,
} from '@/types/api';

export function useReports() {
  const [data, setData] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ReportListResponse>('/reports/');
      setData(res.data.items);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createReport = useCallback(async (formData: FormData) => {
    const res = await api.post<ReportResponse>('/reports/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setData((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const updateReport = useCallback(async (id: number, formData: FormData) => {
    const res = await api.patch<ReportResponse>(`/reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setData((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    return res.data;
  }, []);

  const reviewReport = useCallback(async (id: number, payload: ReviewPayload) => {
    const res = await api.patch<ReportResponse>(`/reports/${id}/review`, payload);
    setData((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    return res.data;
  }, []);

  const getEvidence = useCallback(async (id: number) => {
    const res = await api.get<EvidenceResponse>(`/reports/${id}/evidence`);
    return res.data;
  }, []);

  return { data, loading, error, refetch, createReport, updateReport, reviewReport, getEvidence };
}
