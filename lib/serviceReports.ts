import { ServiceReportResponse, ServiceReportStatusId } from '@/types/api';

export const REPORT_STATUS = {
  PENDING: 1,
  APPROVED_FULL: 2,
  APPROVED_PARTIAL: 3,
  REJECTED: 4,
} as const;

export interface StatusMeta {
  label: string;
  /** Tailwind bg class (soft). */
  bg: string;
  /** Tailwind text class. */
  text: string;
  /** Hex, for icons, stripes and amounts. */
  color: string;
  /** Hex, soft background for inline styles. */
  soft: string;
}

export const REPORT_STATUS_META: Record<ServiceReportStatusId, StatusMeta> = {
  1: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700', color: '#D97706', soft: '#FEF3C7' },
  2: { label: 'Aprobado', bg: 'bg-green-100', text: 'text-green-700', color: '#16A34A', soft: '#DCFCE7' },
  3: { label: 'Aprobado parcial', bg: 'bg-orange-100', text: 'text-orange-700', color: '#EA580C', soft: '#FFEDD5' },
  4: { label: 'Rechazado', bg: 'bg-red-100', text: 'text-red-700', color: '#DC2626', soft: '#FEE2E2' },
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

/**
 * Service hours are whole numbers (SIGEF validates `integer|min:1`). Older
 * reports may still hold decimals, so values are rounded like the web does.
 */
export function formatHours(hours: number | string | null | undefined): string {
  return String(Math.round(Number(hours ?? 0)));
}

/** "3 / 5 h" (approved / reported) for partial approvals, otherwise "5 h". */
export function formatReportHours(report: ServiceReportResponse): string {
  if (report.status.id === REPORT_STATUS.APPROVED_PARTIAL && report.approved_hours != null) {
    return `${formatHours(report.approved_hours)} / ${formatHours(report.hours_spent)} h`;
  }
  return `${formatHours(report.hours_spent)} h`;
}

/**
 * Reviewer notes are hidden while a reopened report is Pending again: they
 * belong to a decision that no longer applies (same rule as the web portal).
 */
export function visibleReviewNotes(report: ServiceReportResponse): string | null {
  if (report.status.id === REPORT_STATUS.PENDING) return null;
  return report.review_notes?.trim() || null;
}

/** Short Spanish date, e.g. "21 oct 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
