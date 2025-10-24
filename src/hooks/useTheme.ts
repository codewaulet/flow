import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';

export interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  textTertiaryColor: string;
}

const colorSchemes = {
  blue: {
    primary: '#2196f3',
    secondary: '#1976d2',
    accent: '#03a9f4',
    background: '#0a0a0a',
    surface: '#1a1a1a'
  },
  purple: {
    primary: '#9c27b0',
    secondary: '#7b1fa2',
    accent: '#e91e63',
    background: '#0a0a0a',
    surface: '#1a1a1a'
  },
  green: {
    primary: '#4caf50',
    secondary: '#388e3c',
    accent: '#8bc34a',
    background: '#0a0a0a',
    surface: '#1a1a1a'
  },
  orange: {
    primary: '#ff9800',
    secondary: '#f57c00',
    accent: '#ffc107',
    background: '#0a0a0a',
    surface: '#1a1a1a'
  },
  red: {
    primary: '#f44336',
    secondary: '#d32f2f',
    accent: '#ff5722',
    background: '#0a0a0a',
    surface: '#1a1a1a'
  },
  pink: {
    primary: '#e91e63',
    secondary: '#c2185b',
    accent: '#f06292',
    background: '#0a0a0a',
    surface: '#1a1a1a'
  }
};

export const useTheme = () => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode || 'dark';
    const savedColorScheme = localStorage.getItem('theme-color-scheme') as ColorScheme || 'blue';
    
    return {
      mode: savedMode,
      colorScheme: savedColorScheme,
      isDark: savedMode === 'dark' || (savedMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches),
      ...colorSchemes[savedColorScheme],
      textColor: '#ffffff',
      textSecondaryColor: '#b3b3b3',
      textTertiaryColor: '#666666'
    };
  });

  const updateTheme = useCallback((updates: Partial<ThemeState>) => {
    setThemeState(prev => {
      const newState = { ...prev, ...updates };
      
      // Сохраняем в localStorage
      if (updates.mode) {
        localStorage.setItem('theme-mode', updates.mode);
      }
      if (updates.colorScheme) {
        localStorage.setItem('theme-color-scheme', updates.colorScheme);
      }
      
      return newState;
    });
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    updateTheme({ mode });
  }, [updateTheme]);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    const colors = colorSchemes[colorScheme];
    updateTheme({ 
      colorScheme,
      ...colors
    });
  }, [updateTheme]);

  const toggleMode = useCallback(() => {
    const newMode = themeState.mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [themeState.mode, setMode]);

  const resetTheme = useCallback(() => {
    setMode('dark');
    setColorScheme('blue');
  }, [setMode, setColorScheme]);

  // Отслеживание системной темы
  useEffect(() => {
    if (themeState.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setThemeState(prev => ({ ...prev, isDark: e.matches }));
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeState.mode]);

  // Применение CSS переменных
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', themeState.primaryColor);
    root.style.setProperty('--color-secondary', themeState.secondaryColor);
    root.style.setProperty('--color-accent', themeState.accentColor);
    root.style.setProperty('--color-background', themeState.backgroundColor);
    root.style.setProperty('--color-surface', themeState.surfaceColor);
    root.style.setProperty('--color-text', themeState.textColor);
    root.style.setProperty('--color-text-secondary', themeState.textSecondaryColor);
    root.style.setProperty('--color-text-tertiary', themeState.textTertiaryColor);
    
    // Применяем класс темы к body
    document.body.className = `theme-${themeState.colorScheme} ${themeState.isDark ? 'dark' : 'light'}`;
  }, [themeState]);

  return {
    themeState,
    setMode,
    setColorScheme,
    toggleMode,
    resetTheme,
    updateTheme
  };
};