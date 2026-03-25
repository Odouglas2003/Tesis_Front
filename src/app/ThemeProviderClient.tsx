'use client';

import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { getBrandConfig } from '@/services/api';
import { Global, css } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { BrandConfig } from '@/types/interface';

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
      setLocalBrandConfig(brandConfig);
      if (brandConfig.name) setCurrentTheme(brandConfig.name as 'claro' | 'oscuro');
    }
  }, [brandConfig]);

  useEffect(() => {
    if (!brandConfig) {
      (async () => {
        try {
          const fetched = await getBrandConfig();
          if (fetched) {
            setLocalBrandConfig(fetched);
            if (fetched.name) setCurrentTheme(fetched.name as 'claro' | 'oscuro');
          }
        } catch (e) {
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

  const defaultThemes = {
    claro: {
      primary: '#002338',
      secondary: '#002338',
      accent: '#ff6b35',
      background: '#ffffff',
      modal: '#ffffff',
      button: 'rgba(0, 81, 255, 1)',
      text: '#23FFDC',
      navbar: '#0087FF',
      card: '#002338',
      miniCard: 'linear-gradient(135deg, #E0FFFF 0%, #cbf1ffff 100%)',
    },
    oscuro: {
      primary: '#90caf9',
      secondary: '#f48fb1',
      accent: '#ffab40',
      background: '#121212',
      modal: '#1e1e1e',
      button: '#90caf9',
      text: '#ffffff',
      navbar: '#1e1e1e',
      card: '#1e1e1e',
      miniCard: '#2a2a2a',
    },
  };

  const colors = useMemo(() => {
    const defaultTheme = defaultThemes[currentTheme];
    const bc = localBrandConfig || brandConfig;
    if (bc?.theme) {
      return {
        primary: bc.theme.primary || defaultTheme.primary,
        secondary: bc.theme.secondary || defaultTheme.secondary,
        accent: bc.theme.accent || defaultTheme.accent,
        background: bc.theme.background || defaultTheme.background,
        modal: bc.theme.modal || defaultTheme.modal,
        button: bc.theme.button || defaultTheme.button,
        text: bc.theme.text || defaultTheme.text,
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
        setLocalBrandConfig(payload);
        if (payload.name) setCurrentTheme(payload.name as 'claro' | 'oscuro');
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
            paper: colors.card || colors.modal,
          },
          text: {
            primary: colors.text,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                backgroundColor: colors.button,
                color: colors.background,
                '&:hover': {
                  backgroundColor: colors.primary,
                  opacity: 0.8,
                },
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
        },
      }),
    [colors]
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
              color: ${colors.text};
            }

            body {
              font-family: ${fontFamily};
              background-color: ${colors.background};
              color: ${colors.text};
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
              background-color: ${currentTheme === 'claro' ? colors.background : defaultThemes.claro.background};
              color: ${currentTheme === 'claro' ? colors.text : defaultThemes.claro.text};
            }
            
            .theme-oscuro {
              background-color: ${currentTheme === 'oscuro' ? colors.background : defaultThemes.oscuro.background};
              color: ${currentTheme === 'oscuro' ? colors.text : defaultThemes.oscuro.text};
            }
          `}
        />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
