import { ActivityIndicator, Text, View } from 'react-native';
import ProgressRing from '@/components/ui/ProgressRing';
import StatTile from '@/components/ui/StatTile';
import { COLORS } from '@/constants/theme';
import { REPORT_STATUS_META, formatHours } from '@/lib/serviceReports';
import { ServiceReportsProgress } from '@/types/api';

interface Props {
  progress: ServiceReportsProgress;
  /** Sum of Pending reports' hours (the API only returns approved/rejected totals). */
  pendingHours: number;
  /** Fallback when the API doesn't send `rejected_hours`. */
  rejectedHours: number;
  loading?: boolean;
  error?: string | null;
}

/**
 * Navy hero with the hours ring + one tile per status (approved / in review /
 * rejected). "Remaining" is only stated once, inside the hero.
 */
export default function HoursSummaryCard({ progress, pendingHours, rejectedHours, loading, error }: Props) {
  const approved = progress.approved_hours ?? 0;
  /** null = course without a goal (≠ 0). */
  const required = progress.required_hours;
  const remaining = progress.remaining_hours ?? (required != null ? Math.max(required - approved, 0) : null);
  const percent = required != null && required > 0 ? Math.min((approved / required) * 100, 100) : required === 0 ? 100 : 0;
  const rejected = progress.rejected_hours ?? rejectedHours;

  return (
    <View className="mb-6">
      <View className="mb-3 rounded-3xl p-5" style={{ backgroundColor: COLORS.navy }}>
        {loading ? (
          <ActivityIndicator color={COLORS.celeste} size="large" style={{ marginVertical: 24 }} />
        ) : error ? (
          <Text className="my-4 text-label text-red-300">{error}</Text>
        ) : (
          <View className="flex-row items-center gap-4">
            <ProgressRing percent={percent} size={88} strokeWidth={9} color={COLORS.celeste} trackColor="rgba(255,255,255,0.14)">
              <Text className="text-heading font-bold text-white">{Math.round(percent)}%</Text>
            </ProgressRing>
            <View className="flex-1">
              {/* Course without a goal yet (required_service_hours null in SIGEF): "x / 0 h" until it's set */}
              <Text className="text-display font-bold text-white">
                {formatHours(approved)}
                <Text className="text-body font-normal" style={{ color: COLORS.onNavyMuted }}> / {formatHours(required ?? 0)} h</Text>
              </Text>
              <Text className="text-label" style={{ color: COLORS.onNavyMuted }}>
                {required == null
                  ? 'Tu curso aún no tiene meta de horas'
                  : remaining
                    ? `Te faltan ${formatHours(remaining)} horas`
                    : '¡Completaste tu meta de horas!'}
              </Text>
            </View>
          </View>
        )}
      </View>
      <View className="flex-row gap-3">
        <StatTile value={formatHours(approved)} label="Aprobadas" color={REPORT_STATUS_META[2].color} />
        <StatTile value={formatHours(pendingHours)} label="En revisión" color={REPORT_STATUS_META[1].color} />
        <StatTile value={formatHours(rejected)} label="Rechazadas" color={REPORT_STATUS_META[4].color} />
      </View>
    </View>
  );
}
