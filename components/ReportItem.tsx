import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { CircleCheck, Clock, FileText, PenLine, XCircle } from 'lucide-react-native';
import StatusPill from '@/components/StatusPill';
import { REPORT_STATUS, REPORT_STATUS_META, formatDate, formatReportHours, isReportEditable } from '@/lib/serviceReports';
import { ServiceReportResponse } from '@/types/api';

interface Props {
  report: ServiceReportResponse;
  categoryName?: string;
  /** Summary view: no evidence/edit actions. */
  readOnly?: boolean;
  openingEvidence?: boolean;
  onViewEvidence?: () => void;
  onEdit?: () => void;
}

function StatusIcon({ statusId, color }: { statusId: number; color: string }) {
  if (statusId === REPORT_STATUS.PENDING) return <Clock color={color} size={22} />;
  if (statusId === REPORT_STATUS.REJECTED) return <XCircle color={color} size={22} />;
  return <CircleCheck color={color} size={22} />;
}

export default function ReportItem({ report, categoryName, readOnly, openingEvidence, onViewEvidence, onEdit }: Props) {
  const meta = REPORT_STATUS_META[report.status.id] ?? REPORT_STATUS_META[1];
  const editable = isReportEditable(report);
  const showActions = !readOnly && (onViewEvidence || (onEdit && editable));

  return (
    <View
      className="bg-white rounded-2xl p-4"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
    >
      <View className="flex-row items-center gap-4">
        <View className={`w-11 h-11 rounded-full items-center justify-center ${meta.bg}`}>
          <StatusIcon statusId={report.status.id} color={meta.color} />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
            {categoryName ?? 'Servicio'}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={readOnly ? 1 : 2}>
            {report.description}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">{formatDate(report.created_at)}</Text>
        </View>

        <View className="items-end gap-1">
          <Text className="text-sm font-bold" style={{ color: meta.color }}>
            {formatReportHours(report)}
          </Text>
          <StatusPill label={report.status.name || meta.label} bgClass={meta.bg} textClass={meta.text} />
        </View>
      </View>

      {!readOnly && report.review_notes ? (
        <View className="mt-3 bg-gray-50 rounded-xl px-3 py-2">
          <Text className="text-xs text-gray-600">
            <Text className="font-semibold">Nota del revisor: </Text>
            {report.review_notes}
          </Text>
        </View>
      ) : null}

      {showActions ? (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
          {onViewEvidence ? (
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 active:opacity-70"
              onPress={onViewEvidence}
              disabled={openingEvidence}
            >
              {openingEvidence ? <ActivityIndicator size="small" color="#3B82F6" /> : <FileText color="#3B82F6" size={16} />}
              <Text className="text-xs font-semibold text-blue-600">Ver evidencia</Text>
            </Pressable>
          ) : null}
          {onEdit && editable ? (
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 active:opacity-70"
              onPress={onEdit}
            >
              <PenLine color="#374151" size={16} />
              <Text className="text-xs font-semibold text-gray-700">Editar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
