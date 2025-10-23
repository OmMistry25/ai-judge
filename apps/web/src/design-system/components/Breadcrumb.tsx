/**
 * Breadcrumb Component System
 * 
 * A flexible breadcrumb navigation system with
 * support for links, separators, and responsive behavior.
 */

import React from 'react';
import { ChevronRightIcon } from './Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRightIcon size="sm" color="muted" />,
  className = '',
}) => {
  const breadcrumbClasses = [
    'flex',
    'items-center',
    'space-x-1',
    'text-sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={breadcrumbClasses} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-1 flex-shrink-0" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={item.current ? 'text-gray-900 font-medium' : 'text-gray-500'}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Breadcrumb with home icon
export interface BreadcrumbWithHomeProps extends Omit<BreadcrumbProps, 'items'> {
  items: Array<Omit<BreadcrumbItem, 'label'> & { label: string }>;
  showHome?: boolean;
  homeHref?: string;
}

export const BreadcrumbWithHome: React.FC<BreadcrumbWithHomeProps> = ({
  items,
  separator = <ChevronRightIcon size="sm" color="muted" />,
  showHome = true,
  homeHref = '/',
  className = '',
}) => {
  const breadcrumbClasses = [
    'flex',
    'items-center',
    'space-x-1',
    'text-sm',
    className,
  ].filter(Boolean).join(' ');

  const allItems = showHome
    ? [{ label: 'Home', href: homeHref }, ...items]
    : items;

  return (
    <nav className={breadcrumbClasses} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-1 flex-shrink-0" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={item.current ? 'text-gray-900 font-medium' : 'text-gray-500'}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Compact breadcrumb for mobile
export interface CompactBreadcrumbProps {
  currentPage: string;
  parentPage?: {
    label: string;
    href: string;
  };
  className?: string;
}

export const CompactBreadcrumb: React.FC<CompactBreadcrumbProps> = ({
  currentPage,
  parentPage,
  className = '',
}) => {
  const breadcrumbClasses = [
    'flex',
    'items-center',
    'space-x-1',
    'text-sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={breadcrumbClasses} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {parentPage && (
          <>
            <li>
              <a
                href={parentPage.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {parentPage.label}
              </a>
            </li>
            <li>
              <span className="mx-1 flex-shrink-0" aria-hidden="true">
                <ChevronRightIcon size="sm" color="muted" />
              </span>
            </li>
          </>
        )}
        <li>
          <span className="text-gray-900 font-medium" aria-current="page">
            {currentPage}
          </span>
        </li>
      </ol>
    </nav>
  );
};
