import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/services/api';
import {
  EvidenceResponse,
  ReportListResponse,
  ReportResponse,
  ReportStatus,
  ReviewPayload,
} from '@/types/api';

const PAGE_SIZE = 20;

export function useReports() {
  const [data, setData] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<ReportStatus | null>(null);

  // Guards against a stale (out-of-order) response overwriting a newer one,
  // e.g. rapidly switching status filters.
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad: number, statusFilter: ReportStatus | null, append: boolean) => {
      const requestId = ++requestIdRef.current;
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);
      try {
        const res = await api.get<ReportListResponse>('/reports/', {
          params: {
            page: pageToLoad,
            page_size: PAGE_SIZE,
            ...(statusFilter ? { status: statusFilter } : {}),
          },
        });
        if (requestId !== requestIdRef.current) return;
        setData((prev) => (append ? [...prev, ...res.data.items] : res.data.items));
        setPage(res.data.page);
        setTotal(res.data.total);
      } catch (e: any) {
        if (requestId !== requestIdRef.current) return;
        setError(e?.response?.data?.detail ?? 'Error al cargar reportes');
      } finally {
        if (requestId === requestIdRef.current) {
          append ? setLoadingMore(false) : setLoading(false);
        }
      }
    },
    [],
  );

  const refetch = useCallback(() => fetchPage(1, status, false), [fetchPage, status]);

  const setStatusFilter = useCallback(
    (next: ReportStatus | null) => {
      setStatus(next);
      fetchPage(1, next, false);
    },
    [fetchPage],
  );

  const loadMore = useCallback(() => {
    if (loading || loadingMore) return;
    if (data.length >= total) return;
    fetchPage(page + 1, status, true);
  }, [fetchPage, loading, loadingMore, data.length, total, page, status]);

  useEffect(() => { fetchPage(1, null, false); }, [fetchPage]);

  const createReport = useCallback(async (formData: FormData) => {
    const res = await api.post<ReportResponse>('/reports/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setData((prev) => [res.data, ...prev]);
    setTotal((prev) => prev + 1);
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

  return {
    data,
    loading,
    loadingMore,
    error,
    total,
    page,
    status,
    refetch,
    loadMore,
    setStatusFilter,
    createReport,
    updateReport,
    reviewReport,
    getEvidence,
  };
}
