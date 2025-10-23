/**
 * Design System Tokens Index
 * 
 * This file exports all design system tokens for easy importing.
 */

// Export all token modules
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './borders';

// Re-export commonly used types
export type {
  ColorScale,
  SemanticColors,
  Theme,
} from './colors';

export type {
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  LetterSpacing,
  HeadingLevel,
  BodySize,
  ButtonSize,
} from './typography';

export type {
  SpacingSize,
  SemanticSpacingCategory,
  ResponsiveBreakpoint,
} from './spacing';

export type {
  ShadowSize,
  ElevationLevel,
  FocusColor,
  ComponentType,
} from './shadows';

export type {
  BorderRadius,
  BorderWidth,
  BorderStyle,
  SemanticBorderCategory,
  FocusRingType,
} from './borders';
