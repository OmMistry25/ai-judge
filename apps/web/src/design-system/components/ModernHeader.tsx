/**
 * Modern Header Component
 * 
 * A comprehensive header component that integrates
 * with the existing design system and provides
 * modern navigation patterns.
 */

import React, { useState } from 'react';
import { 
  MenuIcon, 
  BellIcon,
  UserIcon,
  SearchIcon
} from './Icon';
import { IconButton } from './Button';
import { Badge } from './Badge';

export interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  actions?: React.ReactNode;
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
    icon?: React.ReactNode;
  }>;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
    menu?: React.ReactNode;
  };
  notifications?: {
    count: number;
    onClick?: () => void;
  };
  search?: {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
  };
  className?: string;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  navigation = [],
  user,
  notifications,
  search,
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(search?.value || '');

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    search?.onChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search?.onSearch?.(searchValue);
  };

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Top Bar */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <IconButton
                icon={<MenuIcon size="md" />}
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              />
            </div>

            {/* Title */}
            {title && (
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Center Section - Search */}
          {search && (
            <div className="flex-1 max-w-lg mx-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size="sm" color="muted" />
                </div>
                <input
                  type="text"
                  placeholder={search.placeholder || 'Search...'}
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </form>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Navigation */}
            {navigation.length > 0 && (
              <nav className="hidden lg:flex space-x-8">
                {navigation.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      item.active
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </a>
                ))}
              </nav>
            )}

            {/* Notifications */}
            {notifications && (
              <div className="relative">
                <IconButton
                  icon={<BellIcon size="md" />}
                  variant="ghost"
                  size="sm"
                  onClick={notifications.onClick}
                  aria-label="Notifications"
                />
                {notifications.count > 0 && (
                  <Badge
                    variant="error"
                    size="xs"
                    className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center"
                  >
                    {notifications.count > 99 ? '99+' : notifications.count}
                  </Badge>
                )}
              </div>
            )}

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      {user.email && (
                        <p className="text-xs text-gray-500">{user.email}</p>
                      )}
                    </div>
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
                <div className="sm:hidden">
                  <IconButton
                    icon={<UserIcon size="md" />}
                    variant="ghost"
                    size="sm"
                    aria-label="User menu"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="py-2 border-t border-gray-200">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-gray-400" aria-hidden="true">
                        /
                      </span>
                    )}
                    {crumb.href && !crumb.current ? (
                      <a
                        href={crumb.href}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span
                        className={`text-sm ${
                          crumb.current ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}
                        aria-current={crumb.current ? 'page' : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  item.active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </a>
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
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.email && (
                      <p className="text-xs text-gray-500">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
