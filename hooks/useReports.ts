import { useCallback, useEffect, useState } from 'react';
import sigefApi from '@/services/sigefApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { unwrapData } from '@/lib/apiData';
import { openAuthenticatedPdf } from '@/lib/downloadPdf';
import { ServiceReportListResponse, ServiceReportResponse, ServiceReportsProgress } from '@/types/api';

const BASE = '/api/students/service-reports';

const EMPTY_PROGRESS: ServiceReportsProgress = {
  required_hours: null,
  approved_hours: null,
  remaining_hours: null,
  course_name: null,
};

export interface ReportPayload {
  category_id?: number;
  hours_spent?: number;
  description?: string;
  evidence?: { uri: string; name: string; type: string };
}

function toFormData(payload: ReportPayload): FormData {
  const fd = new FormData();
  if (payload.category_id != null) fd.append('category_id', String(payload.category_id));
  if (payload.hours_spent != null) fd.append('hours_spent', String(payload.hours_spent));
  if (payload.description != null) fd.append('description', payload.description);
  if (payload.evidence) fd.append('evidence', payload.evidence as any);
  return fd;
}

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

export function useReports({ autoload = true }: { autoload?: boolean } = {}) {
  const [data, setData] = useState<ServiceReportResponse[]>([]);
  const [progress, setProgress] = useState<ServiceReportsProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sigefApi.get<ServiceReportListResponse>(BASE);
      const reports = [...(res.data.data ?? [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setData(reports);
      setProgress(res.data.progress ?? EMPTY_PROGRESS);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Error al cargar reportes'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (autoload) refetch(); }, [autoload, refetch]);

  const getReport = useCallback(async (id: number) => {
    const res = await sigefApi.get(`${BASE}/${id}`);
    return unwrapData<ServiceReportResponse>(res.data);
  }, []);

  const createReport = useCallback(async (payload: ReportPayload) => {
    const res = await sigefApi.post(BASE, toFormData(payload), MULTIPART);
    const created = unwrapData<ServiceReportResponse>(res.data);
    setData((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateReport = useCallback(async (id: number, payload: ReportPayload) => {
    let res;
    if (payload.evidence) {
      // PHP doesn't parse multipart bodies on PATCH — use Laravel's method
      // spoofing (POST + _method) when a new PDF is attached.
      const fd = toFormData(payload);
      fd.append('_method', 'PATCH');
      res = await sigefApi.post(`${BASE}/${id}`, fd, MULTIPART);
    } else {
      const { evidence: _omit, ...json } = payload;
      res = await sigefApi.patch(`${BASE}/${id}`, json);
    }
    const updated = unwrapData<ServiceReportResponse>(res.data);
    setData((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const openEvidence = useCallback(
    (id: number) => openAuthenticatedPdf(`${BASE}/${id}/evidencia`, `evidencia-${id}.pdf`, 'Evidencia'),
    [],
  );

  return { data, progress, loading, error, refetch, getReport, createReport, updateReport, openEvidence };
}
