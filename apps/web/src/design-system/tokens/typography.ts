/**
 * Design System Typography Tokens
 * 
 * This file defines the complete typography system for the AI Judge application.
 * Includes font families, sizes, weights, line heights, and letter spacing.
 */

// Font families
export const fontFamilies = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Monaco',
    'Cascadia Code',
    'Roboto Mono',
    'Oxygen Mono',
    'Ubuntu Monospace',
    'Source Code Pro',
    'Fira Mono',
    'Droid Sans Mono',
    'monospace',
  ],
  display: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
} as const;

// Font weights
export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

// Font sizes (in rem)
export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
  '8xl': '6rem',    // 96px
  '9xl': '8rem',    // 128px
} as const;

// Line heights
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Letter spacing
export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography scale for headings
export const headingStyles = {
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
    fontFamily: fontFamilies.display.join(', '),
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
    fontFamily: fontFamilies.display.join(', '),
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.display.join(', '),
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.display.join(', '),
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.display.join(', '),
  },
  h6: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.display.join(', '),
  },
} as const;

// Body text styles
export const bodyStyles = {
  large: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.sans.join(', '),
  },
  base: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.sans.join(', '),
  },
  small: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.sans.join(', '),
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.sans.join(', '),
  },
} as const;

// Code styles
export const codeStyles = {
  inline: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.mono.join(', '),
  },
  block: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.mono.join(', '),
  },
} as const;

// Button text styles
export const buttonStyles = {
  large: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.sans.join(', '),
  },
  base: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.sans.join(', '),
  },
  small: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.normal,
    fontFamily: fontFamilies.sans.join(', '),
  },
} as const;

// Utility functions
export const getFontSize = (size: keyof typeof fontSizes): string => fontSizes[size];
export const getFontWeight = (weight: keyof typeof fontWeights): number => fontWeights[weight];
export const getLineHeight = (height: keyof typeof lineHeights): number => lineHeights[height];
export const getLetterSpacing = (spacing: keyof typeof letterSpacings): string => letterSpacings[spacing];

// CSS custom properties generator
export const generateTypographyCSS = () => {
  const cssVars: Record<string, string> = {};
  
  // Font families
  Object.entries(fontFamilies).forEach(([key, value]) => {
    cssVars[`--font-family-${key}`] = value.join(', ');
  });
  
  // Font sizes
  Object.entries(fontSizes).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });
  
  // Font weights
  Object.entries(fontWeights).forEach(([key, value]) => {
    cssVars[`--font-weight-${key}`] = value.toString();
  });
  
  // Line heights
  Object.entries(lineHeights).forEach(([key, value]) => {
    cssVars[`--line-height-${key}`] = value.toString();
  });
  
  // Letter spacing
  Object.entries(letterSpacings).forEach(([key, value]) => {
    cssVars[`--letter-spacing-${key}`] = value;
  });
  
  return cssVars;
};

// Type definitions
export type FontFamily = keyof typeof fontFamilies;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacings;
export type HeadingLevel = keyof typeof headingStyles;
export type BodySize = keyof typeof bodyStyles;
export type ButtonSize = keyof typeof buttonStyles;
