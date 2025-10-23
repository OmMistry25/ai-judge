/**
 * Design System Spacing Tokens
 * 
 * This file defines the complete spacing system for the AI Judge application.
 * Includes consistent spacing scale for margins, padding, gaps, and positioning.
 */

// Base spacing scale (in rem)
export const spacing = {
  0: '0rem',      // 0px
  px: '0.0625rem', // 1px
  0.5: '0.125rem', // 2px
  1: '0.25rem',   // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',    // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',   // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
  11: '2.75rem',  // 44px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  28: '7rem',     // 112px
  32: '8rem',     // 128px
  36: '9rem',     // 144px
  40: '10rem',    // 160px
  44: '11rem',    // 176px
  48: '12rem',    // 192px
  52: '13rem',    // 208px
  56: '14rem',    // 224px
  60: '15rem',    // 240px
  64: '16rem',    // 256px
  72: '18rem',    // 288px
  80: '20rem',    // 320px
  96: '24rem',    // 384px
} as const;

// Semantic spacing tokens
export const semanticSpacing = {
  // Component spacing
  component: {
    xs: spacing[1],    // 4px - Tight spacing for small components
    sm: spacing[2],   // 8px - Small spacing for compact components
    md: spacing[4],   // 16px - Medium spacing for standard components
    lg: spacing[6],   // 24px - Large spacing for prominent components
    xl: spacing[8],   // 32px - Extra large spacing for major components
    '2xl': spacing[12], // 48px - Very large spacing for hero sections
  },
  
  // Layout spacing
  layout: {
    container: spacing[6],   // 24px - Container padding
    section: spacing[16],    // 64px - Section spacing
    page: spacing[8],        // 32px - Page-level spacing
    grid: spacing[4],        // 16px - Grid gap
    stack: spacing[4],       // 16px - Stack gap
  },
  
  // Form spacing
  form: {
    field: spacing[4],       // 16px - Field spacing
    group: spacing[6],       // 24px - Form group spacing
    section: spacing[8],     // 32px - Form section spacing
    label: spacing[1],       // 4px - Label spacing
    help: spacing[1],        // 4px - Help text spacing
  },
  
  // Navigation spacing
  nav: {
    item: spacing[2],        // 8px - Navigation item spacing
    group: spacing[4],       // 16px - Navigation group spacing
    section: spacing[6],     // 24px - Navigation section spacing
  },
  
  // Card spacing
  card: {
    padding: spacing[6],      // 24px - Card padding
    gap: spacing[4],         // 16px - Card content gap
    header: spacing[4],      // 16px - Card header spacing
    footer: spacing[4],      // 16px - Card footer spacing
  },
  
  // Table spacing
  table: {
    cell: spacing[3],        // 12px - Table cell padding
    header: spacing[4],      // 16px - Table header padding
    row: spacing[2],         // 8px - Table row spacing
  },
  
  // Button spacing
  button: {
    padding: {
      sm: `${spacing[1]} ${spacing[2]}`,     // 4px 8px
      md: `${spacing[2]} ${spacing[4]}`,     // 8px 16px
      lg: `${spacing[3]} ${spacing[6]}`,     // 12px 24px
    },
    gap: spacing[1],         // 4px - Button content gap
  },
  
  // Input spacing
  input: {
    padding: {
      sm: `${spacing[1]} ${spacing[2]}`,     // 4px 8px
      md: `${spacing[2]} ${spacing[3]}`,     // 8px 12px
      lg: `${spacing[3]} ${spacing[4]}`,     // 12px 16px
    },
    gap: spacing[2],         // 8px - Input content gap
  },
} as const;

// Responsive spacing
export const responsiveSpacing = {
  // Mobile-first spacing scale
  mobile: {
    xs: spacing[1],          // 4px
    sm: spacing[2],          // 8px
    md: spacing[4],          // 16px
    lg: spacing[6],          // 24px
    xl: spacing[8],          // 32px
  },
  
  // Tablet spacing
  tablet: {
    xs: spacing[1.5],        // 6px
    sm: spacing[3],          // 12px
    md: spacing[6],          // 24px
    lg: spacing[8],          // 32px
    xl: spacing[12],         // 48px
  },
  
  // Desktop spacing
  desktop: {
    xs: spacing[2],          // 8px
    sm: spacing[4],          // 16px
    md: spacing[8],          // 32px
    lg: spacing[12],         // 48px
    xl: spacing[16],         // 64px
  },
} as const;

// Utility functions
export const getSpacing = (size: keyof typeof spacing): string => spacing[size];
export const getSemanticSpacing = (category: keyof typeof semanticSpacing, size: string): string => {
  const categorySpacing = semanticSpacing[category];
  return (categorySpacing as any)[size] || spacing[4];
};

// CSS custom properties generator
export const generateSpacingCSS = () => {
  const cssVars: Record<string, string> = {};
  
  // Base spacing scale
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });
  
  // Semantic spacing
  Object.entries(semanticSpacing).forEach(([category, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      cssVars[`--spacing-${category}-${key}`] = value;
    });
  });
  
  // Responsive spacing
  Object.entries(responsiveSpacing).forEach(([breakpoint, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      cssVars[`--spacing-${breakpoint}-${key}`] = value;
    });
  });
  
  return cssVars;
};

// Spacing utility classes generator
export const generateSpacingUtilities = () => {
  const utilities: Record<string, string> = {};
  
  // Margin utilities
  Object.entries(spacing).forEach(([key, value]) => {
    utilities[`.m-${key}`] = `margin: ${value}`;
    utilities[`.mx-${key}`] = `margin-left: ${value}; margin-right: ${value}`;
    utilities[`.my-${key}`] = `margin-top: ${value}; margin-bottom: ${value}`;
    utilities[`.mt-${key}`] = `margin-top: ${value}`;
    utilities[`.mr-${key}`] = `margin-right: ${value}`;
    utilities[`.mb-${key}`] = `margin-bottom: ${value}`;
    utilities[`.ml-${key}`] = `margin-left: ${value}`;
  });
  
  // Padding utilities
  Object.entries(spacing).forEach(([key, value]) => {
    utilities[`.p-${key}`] = `padding: ${value}`;
    utilities[`.px-${key}`] = `padding-left: ${value}; padding-right: ${value}`;
    utilities[`.py-${key}`] = `padding-top: ${value}; padding-bottom: ${value}`;
    utilities[`.pt-${key}`] = `padding-top: ${value}`;
    utilities[`.pr-${key}`] = `padding-right: ${value}`;
    utilities[`.pb-${key}`] = `padding-bottom: ${value}`;
    utilities[`.pl-${key}`] = `padding-left: ${value}`;
  });
  
  // Gap utilities
  Object.entries(spacing).forEach(([key, value]) => {
    utilities[`.gap-${key}`] = `gap: ${value}`;
    utilities[`.gap-x-${key}`] = `column-gap: ${value}`;
    utilities[`.gap-y-${key}`] = `row-gap: ${value}`;
  });
  
  return utilities;
};

// Type definitions
export type SpacingSize = keyof typeof spacing;
export type SemanticSpacingCategory = keyof typeof semanticSpacing;
export type ResponsiveBreakpoint = keyof typeof responsiveSpacing;
