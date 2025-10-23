/**
 * Design System Border Tokens
 * 
 * This file defines the complete border system for the AI Judge application.
 * Includes border radius, border widths, and border styles.
 */

// Border radius scale
export const borderRadius = {
  none: '0',
  xs: '0.125rem',    // 2px
  sm: '0.25rem',     // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// Border width scale
export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const;

// Border styles
export const borderStyles = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  double: 'double',
  none: 'none',
} as const;

// Semantic border tokens
export const semanticBorders = {
  // Component borders
  component: {
    default: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    focus: {
      width: borderWidth[2],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    error: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    success: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
  },
  
  // Card borders
  card: {
    default: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.lg,
    },
    elevated: {
      width: borderWidth[0],
      style: borderStyles.none,
      radius: borderRadius.lg,
    },
    interactive: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.lg,
    },
  },
  
  // Button borders
  button: {
    primary: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    secondary: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    ghost: {
      width: borderWidth[0],
      style: borderStyles.none,
      radius: borderRadius.md,
    },
    pill: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.full,
    },
  },
  
  // Input borders
  input: {
    default: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    focus: {
      width: borderWidth[2],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    error: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    success: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
  },
  
  // Modal borders
  modal: {
    content: {
      width: borderWidth[0],
      style: borderStyles.none,
      radius: borderRadius.xl,
    },
    backdrop: {
      width: borderWidth[0],
      style: borderStyles.none,
      radius: borderRadius.none,
    },
  },
  
  // Table borders
  table: {
    cell: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.none,
    },
    header: {
      width: borderWidth[1],
      style: borderStyles.solid,
      radius: borderRadius.none,
    },
    row: {
      width: borderWidth[0],
      style: borderStyles.none,
      radius: borderRadius.none,
    },
  },
  
  // Navigation borders
  nav: {
    item: {
      width: borderWidth[0],
      style: borderStyles.none,
      radius: borderRadius.md,
    },
    active: {
      width: borderWidth[2],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
  },
} as const;

// Focus ring definitions
export const focusRings = {
  primary: {
    width: '3px',
    style: borderStyles.solid,
    offset: '2px',
  },
  secondary: {
    width: '2px',
    style: borderStyles.solid,
    offset: '1px',
  },
  error: {
    width: '3px',
    style: borderStyles.solid,
    offset: '2px',
  },
  success: {
    width: '3px',
    style: borderStyles.solid,
    offset: '2px',
  },
} as const;

// Utility functions
export const getBorderRadius = (size: keyof typeof borderRadius): string => borderRadius[size];
export const getBorderWidth = (width: keyof typeof borderWidth): string => borderWidth[width];
export const getBorderStyle = (style: keyof typeof borderStyles): string => borderStyles[style];

// CSS custom properties generator
export const generateBorderCSS = () => {
  const cssVars: Record<string, string> = {};
  
  // Border radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    cssVars[`--border-radius-${key}`] = value;
  });
  
  // Border width
  Object.entries(borderWidth).forEach(([key, value]) => {
    cssVars[`--border-width-${key}`] = value;
  });
  
  // Border styles
  Object.entries(borderStyles).forEach(([key, value]) => {
    cssVars[`--border-style-${key}`] = value;
  });
  
  // Semantic borders
  Object.entries(semanticBorders).forEach(([category, borders]) => {
    Object.entries(borders).forEach(([key, border]) => {
      cssVars[`--border-${category}-${key}-width`] = border.width;
      cssVars[`--border-${category}-${key}-style`] = border.style;
      cssVars[`--border-${category}-${key}-radius`] = border.radius;
    });
  });
  
  // Focus rings
  Object.entries(focusRings).forEach(([key, ring]) => {
    cssVars[`--focus-ring-${key}-width`] = ring.width;
    cssVars[`--focus-ring-${key}-style`] = ring.style;
    cssVars[`--focus-ring-${key}-offset`] = ring.offset;
  });
  
  return cssVars;
};

// Border utility classes generator
export const generateBorderUtilities = () => {
  const utilities: Record<string, string> = {};
  
  // Border radius utilities
  Object.entries(borderRadius).forEach(([key, value]) => {
    utilities[`.rounded-${key}`] = `border-radius: ${value}`;
    utilities[`.rounded-t-${key}`] = `border-top-left-radius: ${value}; border-top-right-radius: ${value}`;
    utilities[`.rounded-r-${key}`] = `border-top-right-radius: ${value}; border-bottom-right-radius: ${value}`;
    utilities[`.rounded-b-${key}`] = `border-bottom-left-radius: ${value}; border-bottom-right-radius: ${value}`;
    utilities[`.rounded-l-${key}`] = `border-top-left-radius: ${value}; border-bottom-left-radius: ${value}`;
  });
  
  // Border width utilities
  Object.entries(borderWidth).forEach(([key, value]) => {
    utilities[`.border-${key}`] = `border-width: ${value}`;
    utilities[`.border-t-${key}`] = `border-top-width: ${value}`;
    utilities[`.border-r-${key}`] = `border-right-width: ${value}`;
    utilities[`.border-b-${key}`] = `border-bottom-width: ${value}`;
    utilities[`.border-l-${key}`] = `border-left-width: ${value}`;
  });
  
  // Border style utilities
  Object.entries(borderStyles).forEach(([key, value]) => {
    utilities[`.border-${key}`] = `border-style: ${value}`;
  });
  
  return utilities;
};

// Type definitions
export type BorderRadius = keyof typeof borderRadius;
export type BorderWidth = keyof typeof borderWidth;
export type BorderStyle = keyof typeof borderStyles;
export type SemanticBorderCategory = keyof typeof semanticBorders;
export type FocusRingType = keyof typeof focusRings;
