/**
 * Design System Shadow Tokens
 * 
 * This file defines the complete shadow system for the AI Judge application.
 * Includes elevation shadows, focus shadows, and decorative shadows.
 */

// Base shadow definitions
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// Elevation shadows for depth
export const elevationShadows = {
  level0: shadows.none,
  level1: shadows.xs,
  level2: shadows.sm,
  level3: shadows.md,
  level4: shadows.lg,
  level5: shadows.xl,
  level6: shadows['2xl'],
} as const;

// Focus shadows for accessibility
export const focusShadows = {
  primary: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  secondary: '0 0 0 3px rgba(107, 114, 128, 0.1)',
  success: '0 0 0 3px rgba(34, 197, 94, 0.1)',
  warning: '0 0 0 3px rgba(245, 158, 11, 0.1)',
  error: '0 0 0 3px rgba(239, 68, 68, 0.1)',
  info: '0 0 0 3px rgba(14, 165, 233, 0.1)',
} as const;

// Component-specific shadows
export const componentShadows = {
  // Card shadows
  card: {
    default: shadows.sm,
    hover: shadows.md,
    active: shadows.lg,
    elevated: shadows.xl,
  },
  
  // Button shadows
  button: {
    default: shadows.xs,
    hover: shadows.sm,
    active: shadows.inner,
    disabled: shadows.none,
  },
  
  // Input shadows
  input: {
    default: shadows.none,
    focus: focusShadows.primary,
    error: focusShadows.error,
    success: focusShadows.success,
  },
  
  // Modal shadows
  modal: {
    backdrop: '0 0 0 1000px rgba(0, 0, 0, 0.5)',
    content: shadows['2xl'],
  },
  
  // Dropdown shadows
  dropdown: {
    menu: shadows.lg,
    item: shadows.none,
  },
  
  // Tooltip shadows
  tooltip: {
    default: shadows.md,
    arrow: shadows.sm,
  },
  
  // Toast shadows
  toast: {
    default: shadows.lg,
    success: shadows.lg,
    error: shadows.lg,
    warning: shadows.lg,
    info: shadows.lg,
  },
} as const;

// Dark theme shadows
export const darkShadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
} as const;

// Utility functions
export const getShadow = (size: keyof typeof shadows): string => shadows[size];
export const getElevationShadow = (level: keyof typeof elevationShadows): string => elevationShadows[level];
export const getFocusShadow = (color: keyof typeof focusShadows): string => focusShadows[color];

// CSS custom properties generator
export const generateShadowCSS = (theme: 'light' | 'dark' = 'light') => {
  const cssVars: Record<string, string> = {};
  const shadowSet = theme === 'dark' ? darkShadows : shadows;
  
  // Base shadows
  Object.entries(shadowSet).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });
  
  // Elevation shadows
  Object.entries(elevationShadows).forEach(([key, value]) => {
    cssVars[`--shadow-elevation-${key}`] = value;
  });
  
  // Focus shadows
  Object.entries(focusShadows).forEach(([key, value]) => {
    cssVars[`--shadow-focus-${key}`] = value;
  });
  
  // Component shadows
  Object.entries(componentShadows).forEach(([component, shadows]) => {
    Object.entries(shadows).forEach(([key, value]) => {
      cssVars[`--shadow-${component}-${key}`] = value;
    });
  });
  
  return cssVars;
};

// Shadow utility classes generator
export const generateShadowUtilities = () => {
  const utilities: Record<string, string> = {};
  
  // Base shadow utilities
  Object.entries(shadows).forEach(([key, value]) => {
    utilities[`.shadow-${key}`] = `box-shadow: ${value}`;
  });
  
  // Elevation utilities
  Object.entries(elevationShadows).forEach(([key, value]) => {
    utilities[`.shadow-elevation-${key}`] = `box-shadow: ${value}`;
  });
  
  // Focus utilities
  Object.entries(focusShadows).forEach(([key, value]) => {
    utilities[`.shadow-focus-${key}`] = `box-shadow: ${value}`;
  });
  
  return utilities;
};

// Type definitions
export type ShadowSize = keyof typeof shadows;
export type ElevationLevel = keyof typeof elevationShadows;
export type FocusColor = keyof typeof focusShadows;
export type ComponentType = keyof typeof componentShadows;
export type Theme = 'light' | 'dark';
