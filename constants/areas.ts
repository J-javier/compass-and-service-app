import { Briefcase, Compass, Dumbbell, GraduationCap, Sparkles, Users } from 'lucide-react-native';
import React from 'react';

/**
 * Visual identity (icon + colors) for each Brújula category. Names, ids and
 * subcategories come from GET /api/students/compass/categories — this only
 * decorates them. Matched by normalized name, never by id, since SIGEF
 * category ids aren't guaranteed to be 1–5 in this order.
 */
export interface AreaStyle {
  key: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  subtitleColor: string;
}

const AREA_STYLES: AreaStyle[] = [
  { key: 'espiritual', icon: Sparkles, iconColor: '#7C3AED', iconBg: '#EDE9FE', accentColor: '#7C3AED', subtitleColor: '#E9D5FF' },
  { key: 'familiar', icon: Users, iconColor: '#ffc000', iconBg: '#FFF6DC', accentColor: '#D97706', subtitleColor: '#FDE68A' },
  { key: 'intelectual', icon: GraduationCap, iconColor: '#00b050', iconBg: '#DCEED8', accentColor: '#059669', subtitleColor: '#A7F3D0' },
  { key: 'laboral', icon: Briefcase, iconColor: '#2563EB', iconBg: '#DBEAFE', accentColor: '#2563EB', subtitleColor: '#BFDBFE' },
  { key: 'fisico', icon: Dumbbell, iconColor: '#DC2626', iconBg: '#FEE2E2', accentColor: '#DC2626', subtitleColor: '#FECACA' },
];

const FALLBACK_STYLE: AreaStyle = {
  key: 'default', icon: Compass, iconColor: '#002d4e', iconBg: '#E5E7EB', accentColor: '#002d4e', subtitleColor: '#BFDBFE',
};

export function normalizeName(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function getAreaStyle(categoryName: string): AreaStyle {
  const n = normalizeName(categoryName);
  return AREA_STYLES.find((s) => n.includes(s.key)) ?? (n.includes('salud') ? AREA_STYLES[4] : FALLBACK_STYLE);
}
