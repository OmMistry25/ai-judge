/**
 * Header Layout Component
 * 
 * A flexible header component with navigation, branding,
 * and responsive behavior.
 */

import React from 'react';

export interface HeaderProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'elevated';
  sticky?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  children,
  variant = 'default',
  sticky = false,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-white border-b border-gray-200',
    minimal: 'bg-transparent',
    elevated: 'bg-white shadow-sm',
  };

  const stickyClass = sticky ? 'sticky top-0 z-50' : '';
  
  const headerClasses = [
    'w-full',
    variantClasses[variant],
    stickyClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      {children}
    </header>
  );
};

// Header content with consistent spacing
export interface HeaderContentProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HeaderContent: React.FC<HeaderContentProps> = ({
  children,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-3',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
  };
  
  const contentClasses = [
    'flex',
    'items-center',
    'justify-between',
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={contentClasses}>
      {children}
    </div>
  );
};

// Brand/Logo section
export interface BrandProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export const Brand: React.FC<BrandProps> = ({
  children,
  href,
  className = '',
}) => {
  const brandClasses = [
    'flex',
    'items-center',
    'space-x-2',
    'font-semibold',
    'text-gray-900',
    'hover:text-gray-700',
    'transition-colors',
    className,
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} className={brandClasses}>
        {children}
      </a>
    );
  }

  return (
    <div className={brandClasses}>
      {children}
    </div>
  );
};

// Navigation section
export interface NavProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Nav: React.FC<NavProps> = ({
  children,
  orientation = 'horizontal',
  className = '',
}) => {
  const orientationClasses = {
    horizontal: 'flex items-center space-x-6',
    vertical: 'flex flex-col space-y-2',
  };
  
  const navClasses = [
    orientationClasses[orientation],
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClasses}>
      {children}
    </nav>
  );
};

// Navigation item
export interface NavItemProps {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  children,
  href,
  active = false,
  onClick,
  className = '',
}) => {
  const baseClasses = [
    'px-3',
    'py-2',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-colors',
    active
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    className,
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
};

// Header actions (buttons, user menu, etc.)
export interface HeaderActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  children,
  className = '',
}) => {
  const actionsClasses = [
    'flex',
    'items-center',
    'space-x-4',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={actionsClasses}>
      {children}
    </div>
  );
};

// Mobile menu toggle
export interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({
  isOpen,
  onToggle,
  className = '',
}) => {
  const toggleClasses = [
    'md:hidden',
    'inline-flex',
    'items-center',
    'justify-center',
    'p-2',
    'rounded-md',
    'text-gray-600',
    'hover:text-gray-900',
    'hover:bg-gray-100',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onToggle}
      className={toggleClasses}
      aria-label="Toggle mobile menu"
    >
      {isOpen ? (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
};
