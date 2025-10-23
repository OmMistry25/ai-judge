/**
 * Mobile Navigation Component
 * 
 * A specialized mobile navigation component with
 * touch-friendly interactions and responsive behavior.
 */

import React, { useState } from 'react';
import { 
  CloseIcon, 
  ChevronDownIcon
} from './Icon';
import { Button } from './Button';

export interface MobileNavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  children?: MobileNavigationItem[];
}

export interface MobileNavigationProps {
  items: MobileNavigationItem[];
  brand?: {
    name: string;
    logo?: React.ReactNode;
    href?: string;
  };
  user?: {
    name: string;
    avatar?: string;
    email?: string;
    menu?: React.ReactNode;
  };
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  brand = { name: 'AI Judge' },
  user,
  isOpen,
  onClose,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${className}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Navigation Panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <a
              href={brand.href || '/'}
              className="flex items-center space-x-2 text-lg font-bold text-gray-900"
            >
              {brand.logo}
              <span>{brand.name}</span>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <CloseIcon size="md" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {items.map((item, index) => (
                <MobileNavigationItem key={index} item={item} />
              ))}
            </div>
          </nav>

          {/* User Section */}
          {user && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  {user.email && (
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                {user.menu}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual mobile navigation item
interface MobileNavigationItemProps {
  item: MobileNavigationItem;
}

const MobileNavigationItem: React.FC<MobileNavigationItemProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  if (item.children && item.children.length > 0) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            item.active
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.badge}
              </span>
            )}
          </div>
          <ChevronDownIcon 
            size="sm" 
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
          <div className="pl-6 space-y-1">
            {item.children.map((child, index) => (
              <a
                key={index}
                href={child.href}
                className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                  child.active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {child.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        item.active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {item.icon && <span>{item.icon}</span>}
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.badge}
        </span>
      )}
    </a>
  );
};

// Bottom Navigation for mobile
export interface BottomNavigationProps {
  items: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    active?: boolean;
    badge?: string | number;
  }>;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  className = '',
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden ${className}`}>
      <div className="flex">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors ${
              item.active
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-1">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

// Floating Action Button
export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  label,
  position = 'bottom-right',
  className = '',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const buttonClasses = [
    'fixed',
    'z-40',
    'inline-flex',
    'items-center',
    'justify-center',
    'w-14',
    'h-14',
    'bg-blue-600',
    'text-white',
    'rounded-full',
    'shadow-lg',
    'hover:bg-blue-700',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    'transition-colors',
    positionClasses[position],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      aria-label={label}
    >
      {icon}
    </button>
  );
};
