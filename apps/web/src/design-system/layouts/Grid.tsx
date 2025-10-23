/**
 * Responsive Grid System
 * 
 * A flexible grid system that adapts to different screen sizes
 * with consistent spacing and alignment options.
 */

import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 12,
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
}) => {
  const gapClass = `gap-${gap}`;
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  
  const gridClasses = [
    'grid',
    `grid-cols-${columns}`,
    gapClass,
    alignClass,
    justifyClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export interface GridItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  end?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span,
  start,
  end,
  className = '',
}) => {
  const spanClass = span ? `col-span-${span}` : '';
  const startClass = start ? `col-start-${start}` : '';
  const endClass = end ? `col-end-${end}` : '';
  
  const itemClasses = [
    spanClass,
    startClass,
    endClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClasses}>
      {children}
    </div>
  );
};

// Responsive Grid with breakpoint-specific columns
export interface ResponsiveGridProps {
  children: React.ReactNode;
  mobile?: 1 | 2 | 3 | 4;
  tablet?: 1 | 2 | 3 | 4 | 5 | 6;
  desktop?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  mobile = 1,
  tablet = 2,
  desktop = 3,
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
}) => {
  const gapClass = `gap-${gap}`;
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  
  const gridClasses = [
    'grid',
    `grid-cols-${mobile}`,
    `sm:grid-cols-${tablet}`,
    `lg:grid-cols-${desktop}`,
    gapClass,
    alignClass,
    justifyClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Auto-fit grid for dynamic content
export interface AutoGridProps {
  children: React.ReactNode;
  minWidth?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AutoGrid: React.FC<AutoGridProps> = ({
  children,
  minWidth = '250px',
  gap = 'md',
  className = '',
}) => {
  const gapClass = `gap-${gap}`;
  
  const gridClasses = [
    'grid',
    gapClass,
    className,
  ].filter(Boolean).join(' ');

  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
  };

  return (
    <div className={gridClasses} style={gridStyle}>
      {children}
    </div>
  );
};
