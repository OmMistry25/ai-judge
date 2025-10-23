/**
 * Container System
 * 
 * Flexible container components with consistent max-widths,
 * padding, and responsive behavior.
 */

import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  padding = 'md',
  center = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16',
  };

  const containerClasses = [
    sizeClasses[size],
    paddingClasses[padding],
    center ? 'mx-auto' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

// Section container with consistent spacing
export interface SectionProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'primary' | 'secondary' | 'tertiary';
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  size = 'lg',
  background = 'transparent',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  const backgroundClasses = {
    transparent: '',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
  };

  const sectionClasses = [
    sizeClasses[size],
    backgroundClasses[background],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      {children}
    </section>
  );
};

// Flex container with common flex patterns
export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  wrap = 'nowrap',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  className = '',
}) => {
  const directionClass = `flex-${direction}`;
  const wrapClass = `flex-${wrap}`;
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const gapClass = `gap-${gap}`;
  
  const flexClasses = [
    'flex',
    directionClass,
    wrapClass,
    alignClass,
    justifyClass,
    gapClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
};

// Stack container for vertical layouts
export interface StackProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  align = 'stretch',
  className = '',
}) => {
  const spacingClass = `space-y-${spacing}`;
  const alignClass = `items-${align}`;
  
  const stackClasses = [
    'flex',
    'flex-col',
    spacingClass,
    alignClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={stackClasses}>
      {children}
    </div>
  );
};

// Center container for centering content
export interface CenterProps {
  children: React.ReactNode;
  horizontal?: boolean;
  vertical?: boolean;
  className?: string;
}

export const Center: React.FC<CenterProps> = ({
  children,
  horizontal = true,
  vertical = true,
  className = '',
}) => {
  const centerClasses = [
    horizontal && vertical ? 'flex items-center justify-center' : '',
    horizontal && !vertical ? 'flex justify-center' : '',
    !horizontal && vertical ? 'flex items-center' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={centerClasses}>
      {children}
    </div>
  );
};
