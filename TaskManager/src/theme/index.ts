/**
 * Small shared design-token file so every screen/component pulls colors and
 * spacing from one place instead of hardcoding hex values throughout the
 * app. Palette loosely follows the provided design reference (indigo
 * primary, green success, red danger, orange warning).
 */

export const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  success: '#10B981',
  successBackground: '#D1FAE5',
  danger: '#EF4444',
  dangerBackground: '#FEE2E2',
  warning: '#F59E0B',
  warningBackground: '#FEF3C7',
  warningText: '#92400E',
  gray: '#6B7280',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  star: '#F59E0B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  small: 12,
  body: 14,
  subtitle: 16,
  title: 20,
  heading: 24,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;
