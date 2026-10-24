import { Briefcase, Church, Compass, Dumbbell, GraduationCap, Users } from 'lucide-react-native';
import React from 'react';

/**
 * Visual identity (icon + colors) for each Brújula category. Names, ids and
 * subcategories come from GET /api/students/compass/categories — this only
 * decorates them. Matched by normalized name, never by id, since SIGEF
 * category ids aren't guaranteed to be 1–5 in this order. Same palette as the
 * SIGEF web portal (components/brujula-vida/category-style.ts).
 */
export interface AreaStyle {
  key: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  /** Icon/tint color on light backgrounds (= accent). */
  iconColor: string;
  /** Soft background behind the icon. */
  iconBg: string;
  /** Solid color: area header, active chips, progress bars. */
  accentColor: string;
}

const AREA_STYLES: AreaStyle[] = [
  { key: 'espiritual', icon: Church, iconColor: '#7C3AED', iconBg: '#F5F3FF', accentColor: '#7C3AED' },
  { key: 'familiar', icon: Users, iconColor: '#D97706', iconBg: '#FFFBEB', accentColor: '#D97706' },
  { key: 'intelectual', icon: GraduationCap, iconColor: '#059669', iconBg: '#ECFDF5', accentColor: '#059669' },
  { key: 'laboral', icon: Briefcase, iconColor: '#2563EB', iconBg: '#EFF6FF', accentColor: '#2563EB' },
  { key: 'fisico', icon: Dumbbell, iconColor: '#EA580C', iconBg: '#FFF7ED', accentColor: '#EA580C' },
];

const FALLBACK_STYLE: AreaStyle = {
  key: 'default', icon: Compass, iconColor: '#0B2545', iconBg: '#E5E7EB', accentColor: '#0B2545',
};

/** Lowercase, accent-free version of a name, for matching. */
export function normalizeName(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Visual identity of an area by name ("Salud" maps to Físico). */
export function getAreaStyle(categoryName: string): AreaStyle {
  const n = normalizeName(categoryName);
  return AREA_STYLES.find((s) => n.includes(s.key)) ?? (n.includes('salud') ? AREA_STYLES[4] : FALLBACK_STYLE);
}
