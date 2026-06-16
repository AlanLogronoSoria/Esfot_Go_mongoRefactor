// ═══════════════════════════════════════════════════════
// ESFOT Go — Design System
// ═══════════════════════════════════════════════════════
// Institutional brand: EPN Blue #042c5c · Gold #fabb54 · Red #eb2f26

export const DarkTheme = {
  primary: '#0033A0',
  primaryLight: '#1A5BCF',
  primaryMuted: 'rgba(0,51,160,0.25)',
  primaryGlow: 'rgba(0,51,160,0.5)',

  accent: '#FFB81C',
  accentLight: '#FFD166',
  accentMuted: 'rgba(255,184,28,0.15)',

  background: '#0D0D0F',
  backgroundElevated: '#141416',
  backgroundCard: '#1A1A1E',

  surface: '#1C1C1E',
  surfaceGlass: 'rgba(28,28,30,0.75)',
  surfaceBorder: 'rgba(255,255,255,0.06)',

  text: '#FFFFFF',
  textPrimary: '#F5F5F7',
  textSecondary: '#98989E',
  textTertiary: '#636369',
  textMuted: '#48484E',

  success: '#30D158',
  successBg: 'rgba(48,209,88,0.12)',
  warning: '#FFD60A',
  warningBg: 'rgba(255,214,10,0.12)',
  error: '#FF453A',
  errorBg: 'rgba(255,69,58,0.12)',
  info: '#64D2FF',
  infoBg: 'rgba(100,210,255,0.12)',

  inputBg: '#1C1C1E',
  inputBorder: 'rgba(255,255,255,0.08)',
  inputBorderFocus: 'rgba(0,51,160,0.6)',
  inputPlaceholder: '#636369',
  inputText: '#F5F5F7',

  tabBarBg: 'rgba(13,13,15,0.85)',
  tabBarBorder: 'rgba(255,255,255,0.04)',
  tabBarActive: '#FFFFFF',
  tabBarInactive: '#636369',

  cardBorder: 'rgba(255,255,255,0.06)',
  divider: 'rgba(255,255,255,0.05)',

  skeleton: '#1C1C1E',
  skeletonShimmer: '#2C2C2E',
  overlay: 'rgba(0,0,0,0.45)',
  pressed: 'rgba(255,255,255,0.06)',
} as const;

// ─── Institutional Light Theme ───

export const LightTheme = {
  primary: '#042c5c',
  primaryLight: '#1a4a8a',
  primaryMuted: 'rgba(4,44,92,0.10)',
  primaryGlow: 'rgba(4,44,92,0.18)',

  accent: '#eb2f26',
  accentLight: '#ef5a52',
  accentMuted: 'rgba(235,47,38,0.10)',

  highlight: '#fabb54',
  highlightLight: '#fcca77',
  highlightMuted: 'rgba(250,187,84,0.15)',

  neutral: '#827372',
  neutralLight: '#a39493',
  neutralMuted: 'rgba(130,115,114,0.10)',

  background: '#F8FAFC',
  backgroundElevated: '#FFFFFF',
  backgroundCard: '#FFFFFF',

  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255,255,255,0.80)',
  surfaceBorder: 'rgba(0,0,0,0.06)',

  text: '#0b1c30',
  textPrimary: '#0b1c30',
  textSecondary: '#827372',
  textTertiary: '#a39493',
  textMuted: '#c4bfbe',

  success: '#059669',
  successBg: 'rgba(5,150,105,0.10)',
  warning: '#fabb54',
  warningBg: 'rgba(250,187,84,0.12)',
  error: '#eb2f26',
  errorBg: 'rgba(235,47,38,0.08)',
  info: '#042c5c',
  infoBg: 'rgba(4,44,92,0.08)',

  inputBg: '#F1F5F9',
  inputBorder: 'rgba(0,0,0,0.10)',
  inputBorderFocus: 'rgba(4,44,92,0.40)',
  inputPlaceholder: '#a39493',
  inputText: '#0b1c30',

  tabBarBg: 'rgba(248,250,252,0.92)',
  tabBarBorder: 'rgba(0,0,0,0.06)',
  tabBarActive: '#042c5c',
  tabBarInactive: '#827372',

  cardBorder: 'rgba(0,0,0,0.06)',
  divider: 'rgba(0,0,0,0.05)',

  skeleton: '#E2E8F0',
  skeletonShimmer: '#F1F5F9',
  overlay: 'rgba(0,0,0,0.30)',
  pressed: 'rgba(0,0,0,0.04)',
} as const;

// ═══════════════════════════════════════════════════════
// Shadows
// ═══════════════════════════════════════════════════════

export const Shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
  glow: {
    shadowColor: '#042c5c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ═══════════════════════════════════════════════════════
// Sizes & Spacing
// ═══════════════════════════════════════════════════════

export const Sizes = {
  radiusXs: 8,
  radiusSm: 12,
  radiusMd: 16,
  radiusLg: 20,
  radiusXl: 28,
  radiusFull: 999,

  paddingXs: 6,
  paddingSm: 10,
  paddingMd: 16,
  paddingLg: 20,
  paddingXl: 24,

  gapXs: 4,
  gapSm: 8,
  gapMd: 14,
  gapLg: 20,
  gapXl: 28,

  iconXs: 14,
  iconSm: 18,
  iconMd: 24,
  iconLg: 32,
  iconXl: 40,

  btnHeight: 54,
  inputHeight: 54,

  headerH: 220,
  tabH: 60,
} as const;

// ═══════════════════════════════════════════════════════
// Typography
// ═══════════════════════════════════════════════════════

export const Typography = {
  display: { fontSize: 36, fontWeight: '800' as const, lineHeight: 44, letterSpacing: -1 },
  h1: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  h4: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  overline: { fontSize: 10, fontWeight: '700' as const, lineHeight: 12, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  button: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.3 },
} as const;

// ═══════════════════════════════════════════════════════
// Glass & Blur
// ═══════════════════════════════════════════════════════

export const Glass = {
  bg: 'rgba(28,28,30,0.75)',
  border: 'rgba(255,255,255,0.06)',
  backdrop: 'rgba(13,13,15,0.5)',
  lightBg: 'rgba(255,255,255,0.80)',
  lightBorder: 'rgba(0,0,0,0.06)',
} as const;

export const Blur = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
} as const;

// ═══════════════════════════════════════════════════════
// Motion
// ═══════════════════════════════════════════════════════

export const Motion = {
  durationFast: 150,
  duration: 250,
  durationSlow: 400,
  durationXl: 600,
  spring: { damping: 20, stiffness: 200 },
  springGentle: { damping: 25, stiffness: 150 },
  springBouncy: { damping: 12, stiffness: 180 },
} as const;

// ═══════════════════════════════════════════════════════
// Opacity Tokens
// ═══════════════════════════════════════════════════════

export const Opacity = {
  disabled: 0.4,
  pressed: 0.6,
  hover: 0.8,
  inactive: 0.5,
} as const;

// ═══════════════════════════════════════════════════════
// Z-Index Scale
// ═══════════════════════════════════════════════════════

export const ZIndex = {
  base: 1,
  dropdown: 50,
  sticky: 75,
  fab: 100,
  overlay: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
} as const;

// ═══════════════════════════════════════════════════════
// Brand Constants
// ═══════════════════════════════════════════════════════

export const EPN_GOLD = '#FFB81C';
export const EPN_BLUE = '#0033A0';
export const EPN_WHITE = '#F5F5F7';
