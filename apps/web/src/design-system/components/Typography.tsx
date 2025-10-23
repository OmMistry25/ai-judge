/**
 * Typography Component System
 * 
 * A comprehensive typography system with proper
 * heading hierarchy, readable body text, and accessibility.
 */

import React from 'react';

// Heading Components
export interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'inverse';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  size,
  weight = 'bold',
  color = 'default',
  align = 'left',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    inverse: 'text-white',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const headingClasses = [
    'font-display',
    size ? sizeClasses[size] : '',
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    'leading-tight',
    className,
  ].filter(Boolean).join(' ');

  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

  return React.createElement(Tag, { className: headingClasses }, children);
};

// Text Components
export interface TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'inverse';
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  weight = 'normal',
  color = 'default',
  align = 'left',
  lineHeight = 'normal',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    inverse: 'text-white',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const lineHeightClasses = {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  const textClasses = [
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    lineHeightClasses[lineHeight],
    className,
  ].filter(Boolean).join(' ');

  return (
    <p className={textClasses}>
      {children}
    </p>
  );
};

// Link Component
export interface LinkProps {
  children: React.ReactNode;
  href: string;
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'underline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  external?: boolean;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  variant = 'default',
  size = 'md',
  external = false,
  className = '',
}) => {
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-900',
    primary: 'text-blue-600 hover:text-blue-700',
    secondary: 'text-gray-500 hover:text-gray-700',
    muted: 'text-gray-400 hover:text-gray-600',
    underline: 'text-gray-900 hover:text-gray-700 underline',
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const linkClasses = [
    'font-medium',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    'rounded',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <a
      href={href}
      className={linkClasses}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
};

// Code Component
export interface CodeProps {
  children: React.ReactNode;
  variant?: 'inline' | 'block';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Code: React.FC<CodeProps> = ({
  children,
  variant = 'inline',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    inline: [
      'inline-block',
      'px-1.5',
      'py-0.5',
      'bg-gray-100',
      'text-gray-800',
      'rounded',
      'font-mono',
      'text-sm',
    ],
    block: [
      'block',
      'p-4',
      'bg-gray-900',
      'text-gray-100',
      'rounded-lg',
      'font-mono',
      'overflow-x-auto',
    ],
  };

  const codeClasses = [
    ...variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  if (variant === 'block') {
    return (
      <pre className={codeClasses}>
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <code className={codeClasses}>
      {children}
    </code>
  );
};

// List Components
export interface ListProps {
  children: React.ReactNode;
  variant?: 'unordered' | 'ordered' | 'none';
  spacing?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export const List: React.FC<ListProps> = ({
  children,
  variant = 'unordered',
  spacing = 'normal',
  className = '',
}) => {
  const variantClasses = {
    unordered: 'list-disc',
    ordered: 'list-decimal',
    none: 'list-none',
  };

  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-4',
  };

  const listClasses = [
    variantClasses[variant],
    spacingClasses[spacing],
    'pl-6',
    className,
  ].filter(Boolean).join(' ');

  const Tag = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <Tag className={listClasses}>
      {children}
    </Tag>
  );
};

// List Item Component
export interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  children,
  className = '',
}) => {
  return (
    <li className={className}>
      {children}
    </li>
  );
};

// Quote Component
export interface QuoteProps {
  children: React.ReactNode;
  author?: string;
  source?: string;
  variant?: 'default' | 'large' | 'small';
  className?: string;
}

export const Quote: React.FC<QuoteProps> = ({
  children,
  author,
  source,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'text-lg',
    large: 'text-xl',
    small: 'text-base',
  };

  const quoteClasses = [
    'border-l-4',
    'border-blue-500',
    'pl-4',
    'italic',
    'text-gray-700',
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <blockquote className={quoteClasses}>
      <p>{children}</p>
      {(author || source) && (
        <footer className="mt-2 text-sm text-gray-500">
          {author && <cite className="font-medium">{author}</cite>}
          {author && source && <span> — </span>}
          {source && <span>{source}</span>}
        </footer>
      )}
    </blockquote>
  );
};

// Caption Component
export interface CaptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  className = '',
}) => {
  const captionClasses = [
    'text-xs',
    'text-gray-500',
    'font-medium',
    'uppercase',
    'tracking-wider',
    className,
  ].filter(Boolean).join(' ');

  return (
    <p className={captionClasses}>
      {children}
    </p>
  );
};
