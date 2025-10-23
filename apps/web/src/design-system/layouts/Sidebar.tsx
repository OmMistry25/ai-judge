/**
 * Sidebar Layout Component
 * 
 * A flexible sidebar component with navigation, collapsible behavior,
 * and responsive design.
 */

import React from 'react';

export interface SidebarProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'floating';
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  variant = 'default',
  collapsed = false,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-white border-r border-gray-200',
    minimal: 'bg-gray-50',
    floating: 'bg-white shadow-lg rounded-lg',
  };

  const collapsedClass = collapsed ? 'w-16' : 'w-64';
  
  const sidebarClasses = [
    'flex',
    'flex-col',
    'h-full',
    collapsedClass,
    variantClasses[variant],
    'transition-all',
    'duration-300',
    'ease-in-out',
    className,
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClasses}>
      {children}
    </aside>
  );
};

// Sidebar header with toggle button
export interface SidebarHeaderProps {
  children: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  collapsed = false,
  onToggle,
  className = '',
}) => {
  const headerClasses = [
    'flex',
    'items-center',
    'justify-between',
    'p-4',
    'border-b',
    'border-gray-200',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      {!collapsed && <div className="flex-1">{children}</div>}
      {onToggle && (
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Sidebar navigation
export interface SidebarNavProps {
  children: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  children,
  className = '',
}) => {
  const navClasses = [
    'flex-1',
    'overflow-y-auto',
    'p-4',
    'space-y-2',
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClasses}>
      {children}
    </nav>
  );
};

// Sidebar navigation group
export interface SidebarNavGroupProps {
  children: React.ReactNode;
  title?: string;
  collapsed?: boolean;
  className?: string;
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  children,
  title,
  className = '',
}) => {
  const groupClasses = [
    'space-y-1',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses}>
      {title && (
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Sidebar navigation item
export interface SidebarNavItemProps {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  icon?: React.ReactNode;
  collapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  children,
  href,
  active = false,
  icon,
  collapsed = false,
  onClick,
  className = '',
}) => {
  const baseClasses = [
    'flex',
    'items-center',
    'px-3',
    'py-2',
    'text-sm',
    'font-medium',
    'rounded-md',
    'transition-colors',
    'group',
    active
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {icon && (
        <span className={`mr-3 ${collapsed ? 'mx-auto' : ''}`}>
          {icon}
        </span>
      )}
      {!collapsed && <span>{children}</span>}
      {collapsed && (
        <span className="sr-only">{children}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
};

// Sidebar footer
export interface SidebarFooterProps {
  children: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  className = '',
}) => {
  const footerClasses = [
    'p-4',
    'border-t',
    'border-gray-200',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={footerClasses}>
      {children}
    </div>
  );
};

// Main content area that adjusts to sidebar
export interface MainContentProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  className = '',
}) => {
  const contentClasses = [
    'flex-1',
    'flex',
    'flex-col',
    'min-h-screen',
    'transition-all',
    'duration-300',
    'ease-in-out',
    className,
  ].filter(Boolean).join(' ');

  return (
    <main className={contentClasses}>
      {children}
    </main>
  );
};
