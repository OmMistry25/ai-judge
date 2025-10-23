/**
 * Design System Color Tokens
 * 
 * This file defines the complete color palette for the AI Judge application.
 * Colors are organized by semantic meaning and include light/dark variants.
 */

// Base color palette
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main info
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Special colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Semantic color mappings
export const semanticColors = {
  // Light theme
  light: {
    // Background colors
    background: {
      primary: colors.white,
      secondary: colors.neutral[50],
      tertiary: colors.neutral[100],
      inverse: colors.neutral[900],
    },
    
    // Surface colors
    surface: {
      primary: colors.white,
      secondary: colors.neutral[50],
      tertiary: colors.neutral[100],
      elevated: colors.white,
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Text colors
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
      tertiary: colors.neutral[500],
      inverse: colors.white,
      disabled: colors.neutral[400],
      placeholder: colors.neutral[400],
    },
    
    // Border colors
    border: {
      primary: colors.neutral[200],
      secondary: colors.neutral[300],
      focus: colors.primary[500],
      error: colors.error[500],
      success: colors.success[500],
    },
    
    // Interactive colors
    interactive: {
      primary: colors.primary[500],
      primaryHover: colors.primary[600],
      primaryActive: colors.primary[700],
      secondary: colors.neutral[200],
      secondaryHover: colors.neutral[300],
      secondaryActive: colors.neutral[400],
    },
    
    // Status colors
    status: {
      success: colors.success[500],
      successBg: colors.success[50],
      successText: colors.success[700],
      warning: colors.warning[500],
      warningBg: colors.warning[50],
      warningText: colors.warning[700],
      error: colors.error[500],
      errorBg: colors.error[50],
      errorText: colors.error[700],
      info: colors.info[500],
      infoBg: colors.info[50],
      infoText: colors.info[700],
    },
  },
  
  // Dark theme
  dark: {
    // Background colors
    background: {
      primary: colors.neutral[900],
      secondary: colors.neutral[800],
      tertiary: colors.neutral[700],
      inverse: colors.white,
    },
    
    // Surface colors
    surface: {
      primary: colors.neutral[800],
      secondary: colors.neutral[700],
      tertiary: colors.neutral[600],
      elevated: colors.neutral[700],
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    
    // Text colors
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[300],
      tertiary: colors.neutral[400],
      inverse: colors.neutral[900],
      disabled: colors.neutral[500],
      placeholder: colors.neutral[500],
    },
    
    // Border colors
    border: {
      primary: colors.neutral[600],
      secondary: colors.neutral[500],
      focus: colors.primary[400],
      error: colors.error[400],
      success: colors.success[400],
    },
    
    // Interactive colors
    interactive: {
      primary: colors.primary[400],
      primaryHover: colors.primary[300],
      primaryActive: colors.primary[200],
      secondary: colors.neutral[600],
      secondaryHover: colors.neutral[500],
      secondaryActive: colors.neutral[400],
    },
    
    // Status colors
    status: {
      success: colors.success[400],
      successBg: colors.success[900],
      successText: colors.success[200],
      warning: colors.warning[400],
      warningBg: colors.warning[900],
      warningText: colors.warning[200],
      error: colors.error[400],
      errorBg: colors.error[900],
      errorText: colors.error[200],
      info: colors.info[400],
      infoBg: colors.info[900],
      infoText: colors.info[200],
    },
  },
} as const;

// Color utility functions
export const getColorValue = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found`);
      return colors.neutral[500];
    }
  }
  
  return value;
};

// CSS custom properties generator
export const generateColorCSS = (theme: 'light' | 'dark' = 'light') => {
  const themeColors = semanticColors[theme];
  const cssVars: Record<string, string> = {};
  
  // Background colors
  Object.entries(themeColors.background).forEach(([key, value]) => {
    cssVars[`--color-background-${key}`] = value;
  });
  
  // Surface colors
  Object.entries(themeColors.surface).forEach(([key, value]) => {
    cssVars[`--color-surface-${key}`] = value;
  });
  
  // Text colors
  Object.entries(themeColors.text).forEach(([key, value]) => {
    cssVars[`--color-text-${key}`] = value;
  });
  
  // Border colors
  Object.entries(themeColors.border).forEach(([key, value]) => {
    cssVars[`--color-border-${key}`] = value;
  });
  
  // Interactive colors
  Object.entries(themeColors.interactive).forEach(([key, value]) => {
    cssVars[`--color-interactive-${key}`] = value;
  });
  
  // Status colors
  Object.entries(themeColors.status).forEach(([key, value]) => {
    cssVars[`--color-status-${key}`] = value;
  });
  
  return cssVars;
};

// Type definitions
export type ColorScale = typeof colors.primary;
export type SemanticColors = typeof semanticColors.light;
export type Theme = 'light' | 'dark';
