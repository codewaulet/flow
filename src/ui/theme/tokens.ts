/**
 * Design system tokens for FLOW
 */

export const colors = {
  // Background
  bg: {
    primary: '#05050A',
    secondary: '#0A0A14',
    tertiary: '#0F0F19',
  },
  
  // Accent colors
  accent: {
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    blue: {
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
    },
    pink: {
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
    },
  },
  
  // UI elements
  glass: {
    bg: 'rgba(15, 15, 25, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(167, 139, 250, 0.15)',
  },
  
  // Text
  text: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    accent: '#a78bfa',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(167, 139, 250, 0.5)',
  glowStrong: '0 0 40px rgba(167, 139, 250, 0.7)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
} as const;

export const zIndex = {
  background: 0,
  canvas: 1,
  base: 10,
  ui: 50,
  modal: 100,
  toast: 150,
  splash: 200,
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Glassmorphism preset
export const glassmorphism = {
  background: colors.glass.bg,
  backdropFilter: 'blur(20px) saturate(180%)',
  border: `1px solid ${colors.glass.border}`,
  borderRadius: borderRadius.xl,
} as const;

