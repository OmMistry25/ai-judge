/**
 * Navigation Component System
 * 
 * A comprehensive navigation system with support for
 * desktop, mobile, and responsive navigation patterns.
 */

import React, { useState } from 'react';
import { 
  MenuIcon, 
  CloseIcon, 
  ChevronDownIcon,
  BellIcon
} from './Icon';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface NavigationProps {
  items: NavigationItem[];
  brand?: {
    name: string;
    logo?: React.ReactNode;
    href?: string;
  };
  user?: {
    name: string;
    avatar?: string;
    menu?: React.ReactNode;
  };
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  brand = { name: 'AI Judge' },
  user,
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <a
              href={brand.href || '/'}
              className="flex items-center space-x-2 text-xl font-bold text-gray-900"
            >
              {brand.logo}
              <span>{brand.name}</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {items.map((item, index) => (
              <NavigationItem key={index} item={item} />
            ))}
          </div>

          {/* User Menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
                <BellIcon size="md" />
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                {user.menu}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <CloseIcon size="md" /> : <MenuIcon size="md" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {items.map((item, index) => (
                <MobileNavigationItem key={index} item={item} />
              ))}
              {user && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Individual navigation item
interface NavigationItemProps {
  item: NavigationItem;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ item }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (item.children && item.children.length > 0) {
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            item.active
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.badge}
            </span>
          )}
          <ChevronDownIcon size="sm" />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            {item.children.map((child, index) => (
              <a
                key={index}
                href={child.href}
                className={`block px-4 py-2 text-sm transition-colors ${
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
      className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        item.active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.badge}
        </span>
      )}
    </a>
  );
};

// Mobile navigation item
const MobileNavigationItem: React.FC<NavigationItemProps> = ({ item }) => {
  if (item.children && item.children.length > 0) {
    return (
      <div className="space-y-1">
        <div className="px-3 py-2 text-sm font-medium text-gray-900">
          {item.label}
        </div>
        {item.children.map((child, index) => (
          <a
            key={index}
            href={child.href}
            className={`block px-6 py-2 text-sm transition-colors ${
              child.active
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {child.label}
          </a>
        ))}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        item.active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {item.label}
    </a>
  );
};

// Sidebar Navigation
export interface SidebarNavigationProps {
  items: NavigationItem[];
  collapsed?: boolean;
  className?: string;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  items,
  collapsed = false,
  className = '',
}) => {
  const navClasses = [
    'flex-1',
    'overflow-y-auto',
    'py-4',
    'space-y-1',
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClasses}>
      {items.map((item, index) => (
        <SidebarNavigationItem key={index} item={item} collapsed={collapsed} />
      ))}
    </nav>
  );
};

// Sidebar navigation item
interface SidebarNavigationItemProps {
  item: NavigationItem;
  collapsed: boolean;
}

const SidebarNavigationItem: React.FC<SidebarNavigationItemProps> = ({ item, collapsed }) => {
  if (item.children && item.children.length > 0) {
    return (
      <div className="space-y-1">
        <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
          {!collapsed && item.label}
        </div>
        {item.children.map((child, index) => (
          <a
            key={index}
            href={child.href}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              child.active
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {child.icon && (
              <span className={`mr-3 ${collapsed ? 'mx-auto' : ''}`}>
                {child.icon}
              </span>
            )}
            {!collapsed && <span>{child.label}</span>}
            {collapsed && (
              <span className="sr-only">{child.label}</span>
            )}
          </a>
        ))}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        item.active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {item.icon && (
        <span className={`mr-3 ${collapsed ? 'mx-auto' : ''}`}>
          {item.icon}
        </span>
      )}
      {!collapsed && <span>{item.label}</span>}
      {collapsed && (
        <span className="sr-only">{item.label}</span>
      )}
      {item.badge && !collapsed && (
        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.badge}
        </span>
      )}
    </a>
  );
};
