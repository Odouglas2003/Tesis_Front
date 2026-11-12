export const AUTH_LOGO_SRC = '/image-login.png';

export const AUTH_PALETTE = {
  pageBg: '#F5F7FA',
  overlayBg: 'rgba(234,241,247,.92)',
  panelLeft: '#12304D',
  panelRight: '#FFFFFF',
  title: '#12304D',
  textPrimary: '#F7FBFF',
  textAccent: '#72E6D9',
  inputBg: '#FFFFFF',
  inputBorder: '#C9D3DE',
  inputBorderHover: '#8FAFC8',
  inputText: '#18324A',
  inputPlaceholder: '#6E8297',
  link: '#1D5FA0',
  primaryButton: '#1D5FA0',
  primaryButtonHover: '#174E85',
  primaryButtonText: '#FFFFFF',
  secondaryButton: '#FFFFFF',
  secondaryButtonHover: '#F5F7FA',
  secondaryButtonText: '#12304D',
  divider: '#E2E8EF',
  focus: '#1D5FA0',
} as const;

export const DEFAULT_THEME_PALETTES = {
  claro: {
    primary: '#12304D',
    secondary: '#1D5FA0',
    accent: '#72E6D9',
    background: '#F5F7FA',
    modal: '#FFFFFF',
    button: '#1D5FA0',
    text: '#FFFFFF',
    navbar: '#12304D',
    card: '#FFFFFF',
    miniCard: '#FFFFFF',
  },
  oscuro: {
    primary: '#E2EDF7',
    secondary: '#8FB9E0',
    accent: '#72E6D9',
    background: '#0C1724',
    modal: '#122235',
    button: '#2A6CA8',
    text: '#FFFFFF',
    navbar: '#10263C',
    card: '#122235',
    miniCard:
      'linear-gradient(135deg, rgba(114,230,217,0.12) 0%, rgba(42,108,168,0.18) 100%)',
  },
} as const;

export const THEME_TEXT_COLORS = {
  claro: {
    primary: '#0F2233',
    secondary: '#566779',
  },
  oscuro: {
    primary: '#E2EDF7',
    secondary: '#9FB5C9',
  },
} as const;

// Tokens de la interfaz (rediseño 2026-11). Usar estos valores en componentes nuevos.
export const UI = {
  ink: '#0F2233',
  inkSoft: '#32475B',
  muted: '#566779',
  border: '#E2E8EF',
  borderStrong: '#C9D3DE',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F7FA',
  track: '#EEF2F6',
  blue: '#1D5FA0',
  blueHover: '#174E85',
  blueSoft: '#E3F1FB',
  blueSoftText: '#154A7D',
  teal: '#14B8A6',
  tealSoft: '#DDF5F1',
  tealSoftText: '#0B5F58',
  warnSoft: '#FEF3C7',
  warnSoftText: '#7C4A03',
  danger: '#9F2D12',
  orange: '#C2410C',
  avatarBg: '#DCE7F2',
  radius: '12px',
  radiusControl: '8px',
  maxWidth: 1320,
} as const;

export const cardSx = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8EF',
  borderRadius: '12px',
  boxShadow: 'none',
} as const;
