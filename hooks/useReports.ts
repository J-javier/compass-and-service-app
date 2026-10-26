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
  rejected_hours: null,
  remaining_hours: null,
  course_name: null,
};

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

/**
 * Evidence travels in one of two shapes, never both (SIGEF rejects the mix):
 * a PDF, or the three before/during/after photos that the server merges into
 * a PDF. All three photos are required together.
 */
export type ReportEvidence =
  | { kind: 'pdf'; file: UploadFile }
  | { kind: 'photos'; before: UploadFile; during: UploadFile; after: UploadFile };

export interface ReportPayload {
  category_id?: number;
  /** Whole hours, ≥ 1. */
  hours_spent?: number;
  /** Optional; empty string clears it. */
  description?: string;
  evidence?: ReportEvidence;
}

/** Multipart body for create/update; only the evidence of the chosen kind is sent. */
function toFormData(payload: ReportPayload): FormData {
  const fd = new FormData();
  if (payload.category_id != null) fd.append('category_id', String(payload.category_id));
  if (payload.hours_spent != null) fd.append('hours_spent', String(payload.hours_spent));
  if (payload.description != null) fd.append('description', payload.description);
  const ev = payload.evidence;
  if (ev?.kind === 'pdf') {
    fd.append('evidence', ev.file as any);
  } else if (ev?.kind === 'photos') {
    fd.append('evidence_before', ev.before as any);
    fd.append('evidence_during', ev.during as any);
    fd.append('evidence_after', ev.after as any);
  }
  return fd;
}

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

/** Service reports of the signed-in student, with hours progress and mutations. */
export function useReports({ autoload = true }: { autoload?: boolean } = {}) {
  const [data, setData] = useState<ServiceReportResponse[]>([]);
  const [progress, setProgress] = useState<ServiceReportsProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Loads all reports (newest first) and the hours progress. */
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

  /** Fetches one report. */
  const getReport = useCallback(async (id: number) => {
    const res = await sigefApi.get(`${BASE}/${id}`);
    return unwrapData<ServiceReportResponse>(res.data);
  }, []);

  /** Creates a report (multipart) and prepends it to the list. */
  const createReport = useCallback(async (payload: ReportPayload) => {
    const res = await sigefApi.post(BASE, toFormData(payload), MULTIPART);
    const created = unwrapData<ServiceReportResponse>(res.data);
    setData((prev) => [created, ...prev]);
    return created;
  }, []);

  /**
   * Updates a report. PHP doesn't parse multipart bodies on PATCH, so when new
   * evidence is attached it uses Laravel's method spoofing (POST + _method).
   */
  const updateReport = useCallback(async (id: number, payload: ReportPayload) => {
    let res;
    if (payload.evidence) {
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

  /** Downloads a report's evidence PDF and opens it. */
  const openEvidence = useCallback(
    (id: number) => openAuthenticatedPdf(`${BASE}/${id}/evidencia`, `evidencia-${id}.pdf`, 'Evidencia'),
    [],
  );

  return { data, progress, loading, error, refetch, getReport, createReport, updateReport, openEvidence };
}
