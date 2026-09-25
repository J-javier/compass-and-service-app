import { ServiceReportResponse, ServiceReportStatusId } from '@/types/api';

export const REPORT_STATUS = {
  PENDING: 1,
  APPROVED_FULL: 2,
  APPROVED_PARTIAL: 3,
  REJECTED: 4,
} as const;

export interface StatusMeta {
  label: string;
  bg: string; // tailwind bg class
  text: string; // tailwind text class
  color: string; // hex, for icons
}

export const REPORT_STATUS_META: Record<ServiceReportStatusId, StatusMeta> = {
  1: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700', color: '#D97706' },
  2: { label: 'Aprobado', bg: 'bg-green-100', text: 'text-green-700', color: '#16A34A' },
  3: { label: 'Aprobado parcial', bg: 'bg-orange-100', text: 'text-orange-700', color: '#EA580C' },
  4: { label: 'Rechazado', bg: 'bg-red-100', text: 'text-red-700', color: '#DC2626' },
};

/**
 * A report stops being editable as soon as it has been reviewed once — even
 * if staff later reopens it (status back to Pendiente). The backend enforces
 * this with 409 report_not_editable; the UI hides the action with the same
 * rule. `reviewed_at` is checked too because `reviewer_id` isn't part of the
 * documented response and may be missing.
 */
export function isReportEditable(report: ServiceReportResponse): boolean {
  return report.reviewer_id == null && report.reviewed_at == null;
}

/** "5/3h" for partial approvals, otherwise just the submitted hours. */
export function formatReportHours(report: ServiceReportResponse): string {
  if (report.status.id === REPORT_STATUS.APPROVED_PARTIAL && report.approved_hours != null) {
    return `${report.hours_spent}/${report.approved_hours}h`;
  }
  return `${report.hours_spent}h`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
