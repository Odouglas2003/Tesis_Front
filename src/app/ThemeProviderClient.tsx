'use client';

import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { getBrandConfig, getImageUrl } from '@/services/api';
import { Global, css } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { BrandConfig } from '@/types/interface';
import { DEFAULT_THEME_PALETTES, THEME_TEXT_COLORS } from '@/theme/appPalette';

interface ThemeProviderClientProps {
  children: React.ReactNode;
  brandConfig?: BrandConfig | null;
}

const ThemeContext = createContext<{
  currentTheme: 'claro' | 'oscuro';
  toggleTheme: () => void;
  colors: Record<string, string>;
  brandConfig: BrandConfig | null;
} | null>(null);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProviderClient');
  }
  return context;
};

const isRemoteOrStaticAsset = (value?: string | null) =>
  Boolean(value && (/^https?:\/\//i.test(value) || value.startsWith("/") || value.startsWith("data:")));

const resolveBrandAsset = async (value?: string | null) => {
  if (!value) return value ?? undefined;
  if (isRemoteOrStaticAsset(value)) return value;
  try {
    return await getImageUrl(value);
  } catch {
    return value;
  }
};

const hydrateBrandConfigAssets = async (value: BrandConfig | null | undefined) => {
  if (!value) return null;

  const [logo, favicon] = await Promise.all([
    resolveBrandAsset(value.logo),
    resolveBrandAsset(value.favicon),
  ]);

  return {
    ...value,
    logo,
    favicon,
  } satisfies BrandConfig;
};

export default function ThemeProviderClient({
  children,
  brandConfig,
}: ThemeProviderClientProps) {
  const [currentTheme, setCurrentTheme] = useState<'claro' | 'oscuro'>('claro');
  const [localBrandConfig, setLocalBrandConfig] = useState<BrandConfig | null>(brandConfig || null);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as 'claro' | 'oscuro';
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (brandConfig) {
      (async () => {
        const hydrated = await hydrateBrandConfigAssets(brandConfig);
        setLocalBrandConfig(hydrated);
        if (hydrated?.name) setCurrentTheme(hydrated.name as 'claro' | 'oscuro');
      })();
    }
  }, [brandConfig]);

  useEffect(() => {
    if (!brandConfig) {
      (async () => {
        try {
          const fetched = await getBrandConfig();
          if (fetched) {
            const hydrated = await hydrateBrandConfigAssets(fetched);
            setLocalBrandConfig(hydrated);
            if (hydrated?.name) setCurrentTheme(hydrated.name as 'claro' | 'oscuro');
          }
        } catch {
        }
      })();
    }
  }, [brandConfig]);

  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'claro' ? 'oscuro' : 'claro');
  };

  const colors = useMemo(() => {
    const defaultTheme = DEFAULT_THEME_PALETTES[currentTheme];
    const bc = localBrandConfig || brandConfig;
    if (bc?.theme) {
      return {
        primary: bc.theme.primary || bc.theme.navbar || defaultTheme.primary,
        secondary: bc.theme.secondary || bc.theme.button || defaultTheme.secondary,
        accent: bc.theme.accent || bc.theme.text || defaultTheme.accent,
        background: bc.theme.background || defaultTheme.background,
        modal: bc.theme.modal || defaultTheme.modal,
        button: bc.theme.button || defaultTheme.button,
        text: bc.theme.text || bc.theme.accent || defaultTheme.text,
        navbar: bc.theme.navbar || defaultTheme.navbar,
        card: bc.theme.card || defaultTheme.card,
        miniCard: bc.theme.miniCard || defaultTheme.miniCard,
      };
    }
    return defaultTheme;
  }, [localBrandConfig, brandConfig, currentTheme]);

  useEffect(() => {
    const favicon = localBrandConfig?.favicon || brandConfig?.favicon;
    if (favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement ||
                   document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [localBrandConfig?.favicon, brandConfig?.favicon]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const ce = ev as CustomEvent<BrandConfig>;
      const payload = ce?.detail;
      if (payload) {
        (async () => {
          const hydrated = await hydrateBrandConfigAssets(payload);
          setLocalBrandConfig(hydrated);
          if (hydrated?.name) setCurrentTheme(hydrated.name as 'claro' | 'oscuro');
        })();
      }
    };
    window.addEventListener('brandConfig:update', handler as EventListener);
    return () => window.removeEventListener('brandConfig:update', handler as EventListener);
  }, []);

  const poppinsUrl =
    'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
  const robotoUrl =
    'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap';

  const fontFamArray = ['Poppins', 'Roboto', 'sans-serif'];
  const fontFamily = fontFamArray.join(', ');

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: colors.primary,
          },
          secondary: {
            main: colors.secondary,
          },
          background: {
            default: colors.background,
            paper: colors.modal || colors.card,
          },
          text: {
            primary: colors.primary || THEME_TEXT_COLORS[currentTheme].primary,
            secondary: colors.secondary || THEME_TEXT_COLORS[currentTheme].secondary,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 12,
              },
              contained: {
                backgroundColor: colors.button,
                color: colors.text,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: colors.primary,
                  opacity: 0.95,
                  boxShadow: 'none',
                },
              },
              outlined: {
                borderColor: colors.button,
                color: colors.button,
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: colors.navbar,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                borderRadius: 20,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: colors.card,
                border: '1px solid rgba(18,48,77,0.08)',
                boxShadow: '0 18px 45px rgba(18,48,77,0.08)',
                borderRadius: 24,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: colors.modal,
                border: '1px solid rgba(18,48,77,0.08)',
                boxShadow: '0 24px 80px rgba(18,48,77,0.16)',
                borderRadius: 28,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: 'rgba(244,248,251,0.95)',
                borderRadius: 18,
                color: colors.primary || THEME_TEXT_COLORS[currentTheme].primary,
                transition: 'border-color .2s ease, box-shadow .2s ease, background-color .2s ease',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(18,48,77,0.12)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(42,108,168,0.28)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.secondary,
                  borderWidth: 1,
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 4px rgba(114,230,217,0.14)',
                },
              },
              input: {
                paddingTop: 14,
                paddingBottom: 14,
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: colors.secondary || THEME_TEXT_COLORS[currentTheme].secondary,
              },
            },
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                borderRadius: 24,
                backgroundColor: colors.modal,
                border: '1px solid rgba(18,48,77,0.08)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                backgroundColor: 'rgba(42,108,168,0.10)',
                color: colors.primary || THEME_TEXT_COLORS[currentTheme].primary,
                fontWeight: 700,
                fontSize: '0.92rem',
                borderBottom: '1px solid rgba(18,48,77,0.08)',
              },
              body: {
                color: colors.primary || THEME_TEXT_COLORS[currentTheme].primary,
                borderBottom: '1px solid rgba(18,48,77,0.06)',
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:hover': {
                  backgroundColor: 'rgba(42,108,168,0.04)',
                },
              },
            },
          },
          MuiTablePagination: {
            styleOverrides: {
              root: {
                color: colors.primary || THEME_TEXT_COLORS[currentTheme].primary,
                borderTop: '1px solid rgba(18,48,77,0.08)',
              },
              toolbar: {
                color: colors.primary || THEME_TEXT_COLORS[currentTheme].primary,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                fontWeight: 600,
              },
            },
          },
          MuiPopover: {
            styleOverrides: {
              paper: {
                borderRadius: 20,
                border: '1px solid rgba(18,48,77,0.08)',
                boxShadow: '0 16px 40px rgba(18,48,77,0.12)',
              },
            },
          },
          MuiModal: {
            styleOverrides: {
              root: {
                backdropFilter: 'blur(6px)',
              },
            },
          },
        },
      }),
    [colors, currentTheme]
  );

  const themeContextValue = {
    currentTheme,
    toggleTheme,
    colors,
    brandConfig: localBrandConfig || brandConfig || null,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={muiTheme}>
        <Global
          styles={css`
            @import url(${poppinsUrl});
            @import url(${robotoUrl});

            :root {
              --color-primary: ${colors.primary};
              --color-secondary: ${colors.secondary};
              --color-accent: ${colors.accent};
              --color-background: ${colors.background};
              --color-modal: ${colors.modal};
              --color-button: ${colors.button};
              --color-text: ${colors.text};
              --color-navbar: ${colors.navbar};
              --color-card: ${colors.card};
              --color-mini-card: ${colors.miniCard};
              --theme-mode: ${currentTheme};
            }

            html {
              font-size: 100%;
              font-family: ${fontFamily};
              background-color: ${colors.background};
              color: ${colors.primary};
            }

            body {
              font-family: ${fontFamily};
              background-color: ${colors.background};
              color: ${colors.primary};
              margin: 0;
              padding: 0;
              transition: background-color 0.3s ease, color 0.3s ease;
            }

            /* Utilidades CSS para usar en componentes */
            .theme-primary { color: ${colors.primary}; }
            .theme-secondary { color: ${colors.secondary}; }
            .theme-accent { color: ${colors.accent}; }
            .theme-text { color: ${colors.text}; }
            
            .theme-bg-primary { background-color: ${colors.primary}; }
            .theme-bg-secondary { background-color: ${colors.secondary}; }
            .theme-bg-accent { background-color: ${colors.accent}; }
            .theme-bg-background { background-color: ${colors.background}; }
            .theme-bg-modal { background-color: ${colors.modal}; }
            .theme-bg-navbar { background-color: ${colors.navbar}; }
            .theme-bg-card { background-color: ${colors.card}; }
            .theme-bg-mini-card { background-color: ${colors.miniCard}; }
            
            .theme-border-primary { border-color: ${colors.primary}; }
            .theme-border-secondary { border-color: ${colors.secondary}; }

            /* Clases para modo oscuro/claro */
            .theme-claro {
              background-color: ${currentTheme === 'claro' ? colors.background : DEFAULT_THEME_PALETTES.claro.background};
              color: ${currentTheme === 'claro' ? colors.primary : DEFAULT_THEME_PALETTES.claro.primary};
            }
            
            .theme-oscuro {
              background-color: ${currentTheme === 'oscuro' ? colors.background : DEFAULT_THEME_PALETTES.oscuro.background};
              color: ${currentTheme === 'oscuro' ? colors.primary : DEFAULT_THEME_PALETTES.oscuro.primary};
            }
          `}
        />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
