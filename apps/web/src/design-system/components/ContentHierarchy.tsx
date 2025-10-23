/**
 * Content Hierarchy Component System
 * 
 * A system for creating proper content hierarchy
 * with consistent spacing and visual relationships.
 */

import React from 'react';
import { Heading, Text, Link } from './Typography';

// Content Section Component
export interface ContentSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  spacing?: 'tight' | 'normal' | 'relaxed' | 'loose';
  className?: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  children,
  title,
  subtitle,
  level = 2,
  spacing = 'normal',
  className = '',
}) => {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-4',
    relaxed: 'space-y-6',
    loose: 'space-y-8',
  };

  const sectionClasses = [
    spacingClasses[spacing],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      {title && (
        <Heading level={level} size="lg" className="mb-2">
          {title}
        </Heading>
      )}
      {subtitle && (
        <Text size="md" color="secondary" className="mb-4">
          {subtitle}
        </Text>
      )}
      {children}
    </section>
  );
};

// Article Component
export interface ArticleProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  author?: string;
  date?: string;
  readingTime?: string;
  className?: string;
}

export const Article: React.FC<ArticleProps> = ({
  children,
  title,
  subtitle,
  author,
  date,
  readingTime,
  className = '',
}) => {
  return (
    <article className={`prose prose-lg max-w-none ${className}`}>
      {title && (
        <header className="mb-8">
          <Heading level={1} size="4xl" className="mb-4">
            {title}
          </Heading>
          {subtitle && (
            <Text size="xl" color="secondary" className="mb-4">
              {subtitle}
            </Text>
          )}
          {(author || date || readingTime) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {author && <span>By {author}</span>}
              {date && <span>{date}</span>}
              {readingTime && <span>{readingTime} read</span>}
            </div>
          )}
        </header>
      )}
      {children}
    </article>
  );
};

// Content Block Component
export interface ContentBlockProps {
  children: React.ReactNode;
  title?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  spacing?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
  children,
  title,
  level = 3,
  spacing = 'normal',
  className = '',
}) => {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
  };

  const blockClasses = [
    spacingClasses[spacing],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={blockClasses}>
      {title && (
        <Heading level={level} size="md" className="mb-3">
          {title}
        </Heading>
      )}
      {children}
    </div>
  );
};

// Paragraph Component
export interface ParagraphProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'secondary' | 'muted';
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  size = 'md',
  color = 'default',
  lineHeight = 'normal',
  className = '',
}) => {
  return (
    <Text
      size={size}
      color={color}
      lineHeight={lineHeight}
      className={className}
    >
      {children}
    </Text>
  );
};

// Definition List Component
export interface DefinitionListProps {
  items: Array<{
    term: string;
    definition: React.ReactNode;
  }>;
  spacing?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export const DefinitionList: React.FC<DefinitionListProps> = ({
  items,
  spacing = 'normal',
  className = '',
}) => {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
  };

  const listClasses = [
    spacingClasses[spacing],
    className,
  ].filter(Boolean).join(' ');

  return (
    <dl className={listClasses}>
      {items.map((item, index) => (
        <div key={index} className="flex flex-col sm:flex-row sm:gap-4">
          <dt className="font-semibold text-gray-900 sm:w-1/3">
            {item.term}
          </dt>
          <dd className="text-gray-700 sm:w-2/3">
            {item.definition}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// Table of Contents Component
export interface TableOfContentsProps {
  items: Array<{
    id: string;
    label: string;
    level: number;
    href?: string;
  }>;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  className = '',
}) => {
  return (
    <nav className={`space-y-1 ${className}`}>
      <Heading level={3} size="sm" className="mb-3">
        Table of Contents
      </Heading>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index}>
            <Link
              href={item.href || `#${item.id}`}
              variant="secondary"
              size="sm"
              className={`block py-1 ${
                item.level === 1 ? 'pl-0' :
                item.level === 2 ? 'pl-4' :
                item.level === 3 ? 'pl-8' :
                'pl-12'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Callout Component
export interface CalloutProps {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  children,
  type = 'info',
  title,
  className = '',
}) => {
  const typeClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const calloutClasses = [
    'p-4',
    'rounded-lg',
    'border-l-4',
    typeClasses[type],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={calloutClasses}>
      {title && (
        <Heading level={4} size="sm" className="mb-2">
          {title}
        </Heading>
      )}
      <div>{children}</div>
    </div>
  );
};

// Divider Component
export interface DividerProps {
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'solid',
  spacing = 'normal',
  className = '',
}) => {
  const variantClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const spacingClasses = {
    tight: 'my-4',
    normal: 'my-6',
    relaxed: 'my-8',
  };

  const dividerClasses = [
    'border-t',
    'border-gray-200',
    variantClasses[variant],
    spacingClasses[spacing],
    className,
  ].filter(Boolean).join(' ');

  return <hr className={dividerClasses} />;
};
