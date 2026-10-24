import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { CircleCheck, Clock, FileText, MessageSquare, PenLine, XCircle } from 'lucide-react-native';
import StatusPill from '@/components/StatusPill';
import { CARD_SHADOW, COLORS } from '@/constants/theme';
import {
  REPORT_STATUS,
  REPORT_STATUS_META,
  formatDate,
  formatReportHours,
  isReportEditable,
  visibleReviewNotes,
} from '@/lib/serviceReports';
import { ServiceReportResponse } from '@/types/api';

interface Props {
  report: ServiceReportResponse;
  categoryName?: string;
  /** Compact summary row: no notes or actions. */
  readOnly?: boolean;
  openingEvidence?: boolean;
  onViewEvidence?: () => void;
  onEdit?: () => void;
}

/** Status icon: clock (pending), X (rejected) or check (approved). */
function StatusIcon({ statusId, color, size }: { statusId: number; color: string; size: number }) {
  if (statusId === REPORT_STATUS.PENDING) return <Clock color={color} size={size} />;
  if (statusId === REPORT_STATUS.REJECTED) return <XCircle color={color} size={size} />;
  return <CircleCheck color={color} size={size} />;
}

/**
 * One service report. `readOnly` renders the compact summary row; otherwise the
 * full card with a status stripe, reviewer notes and actions.
 */
export default function ReportItem({ report, categoryName, readOnly, openingEvidence, onViewEvidence, onEdit }: Props) {
  const meta = REPORT_STATUS_META[report.status.id] ?? REPORT_STATUS_META[1];
  const statusLabel = report.status.name || meta.label;
  const title = categoryName ?? 'Servicio';
  const description = report.description?.trim();

  if (readOnly) {
    return (
      <View className="flex-row items-center gap-3 rounded-2xl bg-white p-3" style={CARD_SHADOW}>
        <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: meta.soft }}>
          <StatusIcon statusId={report.status.id} color={meta.color} size={20} />
        </View>
        <View className="flex-1">
          <Text className="text-body font-semibold text-ink" numberOfLines={1}>{title}</Text>
          <Text className="text-caption text-muted" numberOfLines={1}>{description || statusLabel}</Text>
        </View>
        <View className="items-end">
          <Text className="text-body font-bold" style={{ color: meta.color }}>{formatReportHours(report)}</Text>
          <Text className="text-caption text-muted">{formatDate(report.created_at)}</Text>
        </View>
      </View>
    );
  }

  const notes = visibleReviewNotes(report);
  const editable = isReportEditable(report);
  const showActions = onViewEvidence || (onEdit && editable);

  return (
    <View
      className="rounded-2xl bg-white p-4"
      style={[CARD_SHADOW, { borderLeftWidth: 4, borderLeftColor: meta.color }]}
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <Text className="text-body font-semibold text-ink" numberOfLines={1}>{title}</Text>
          <Text className="text-caption text-muted">{formatDate(report.created_at)}</Text>
        </View>
        <View className="items-end gap-1">
          <Text className="text-body font-bold" style={{ color: meta.color }}>{formatReportHours(report)}</Text>
          <StatusPill label={statusLabel} bgClass={meta.bg} textClass={meta.text} />
        </View>
      </View>

      {description ? (
        <Text className="mt-2 text-label text-muted" numberOfLines={3}>{description}</Text>
      ) : null}

      {notes ? (
        <View className="mt-3 rounded-xl px-3 py-2" style={{ backgroundColor: meta.soft }}>
          <View className="mb-1 flex-row items-center gap-1.5">
            <MessageSquare color={meta.color} size={14} />
            <Text className="text-caption font-semibold" style={{ color: meta.color }}>Comentario del revisor</Text>
          </View>
          <Text className="text-label text-ink">{notes}</Text>
        </View>
      ) : null}

      {showActions ? (
        <View className="mt-3 flex-row gap-5 border-t border-gray-100 pt-3">
          {onViewEvidence ? (
            <Pressable className="flex-row items-center gap-1.5 active:opacity-60" onPress={onViewEvidence} disabled={openingEvidence}>
              {openingEvidence ? <ActivityIndicator size="small" color={COLORS.brand} /> : <FileText color={COLORS.brand} size={16} />}
              <Text className="text-label font-semibold text-brand">Ver evidencia</Text>
            </Pressable>
          ) : null}
          {onEdit && editable ? (
            <Pressable className="flex-row items-center gap-1.5 active:opacity-60" onPress={onEdit}>
              <PenLine color={COLORS.brand} size={16} />
              <Text className="text-label font-semibold text-brand">Editar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
