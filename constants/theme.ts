import { ViewStyle } from 'react-native';

/**
 * Brand colors for props that can't take a className (icon colors, SVG,
 * inline styles). Keep in sync with tailwind.config.js `theme.extend.colors`.
 */
export const COLORS = {
  navy: '#0B2545',
  brand: '#2A7DE1',
  celeste: '#6BB8D3',
  silver: '#8FA3BA',
  silverLight: '#E8EEF5',
  ink: '#0E1B2C',
  muted: '#6B7A8E',
  faint: '#9AA6B6',
  line: '#E1E6ED',
  onNavyMuted: '#A9BCD6',
  white: '#FFFFFF',
} as const;

/** Single card elevation used across the app. */
export const CARD_SHADOW: ViewStyle = {
  shadowColor: '#0B2545',
  shadowOpacity: 0.07,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

/** Dim layer behind modals (navy, not black). */
export const OVERLAY = 'rgba(7, 26, 51, 0.55)';
