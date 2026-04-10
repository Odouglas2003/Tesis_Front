export const AUTH_LOGO_SRC = '/image-login.png';

export const AUTH_PALETTE = {
  pageBg: '#EAF1F7',
  overlayBg: 'rgba(234,241,247,.92)',
  panelLeft: 'linear-gradient(180deg, #153B63 0%, #2A6CA8 100%)',
  panelRight: '#FCFEFF',
  title: '#12304D',
  textPrimary: '#F7FBFF',
  textAccent: '#72E6D9',
  inputBg: '#F4F8FB',
  inputBorder: '#C9D8E6',
  inputBorderHover: '#8FAFC8',
  inputText: '#18324A',
  inputPlaceholder: '#6E8297',
  link: '#2E7ABF',
  primaryButton: '#123B66',
  primaryButtonHover: '#0F3154',
  primaryButtonText: '#7DEBDC',
  secondaryButton: '#DDF8F2',
  secondaryButtonHover: '#C9F3EA',
  secondaryButtonText: '#12304D',
  divider: '#D7E3EC',
  focus: '#72E6D9',
} as const;

export const DEFAULT_THEME_PALETTES = {
  claro: {
    primary: '#12304D',
    secondary: '#2A6CA8',
    accent: '#72E6D9',
    background: '#EAF1F7',
    modal: '#FCFEFF',
    button: '#123B66',
    text: '#72E6D9',
    navbar: '#153B63',
    card: '#FCFEFF',
    miniCard:
      'linear-gradient(135deg, rgba(114,230,217,0.16) 0%, rgba(42,108,168,0.14) 100%)',
  },
  oscuro: {
    primary: '#E2EDF7',
    secondary: '#8FB9E0',
    accent: '#72E6D9',
    background: '#0C1724',
    modal: '#122235',
    button: '#2A6CA8',
    text: '#72E6D9',
    navbar: '#10263C',
    card: '#122235',
    miniCard:
      'linear-gradient(135deg, rgba(114,230,217,0.12) 0%, rgba(42,108,168,0.18) 100%)',
  },
} as const;

export const THEME_TEXT_COLORS = {
  claro: {
    primary: '#12304D',
    secondary: '#627A90',
  },
  oscuro: {
    primary: '#E2EDF7',
    secondary: '#9FB5C9',
  },
} as const;
