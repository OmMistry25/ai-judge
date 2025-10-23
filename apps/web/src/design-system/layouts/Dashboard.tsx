/**
 * Dashboard Layout Component
 * 
 * A comprehensive dashboard layout with header, sidebar,
 * and main content area with responsive behavior.
 */

import React, { useState } from 'react';
import { Header, HeaderContent, Brand, Nav, NavItem, HeaderActions, MobileMenuToggle } from './Header';
import { Sidebar, SidebarHeader, SidebarNav, SidebarNavGroup, SidebarNavItem, SidebarFooter, MainContent } from './Sidebar';
import { Container } from './Container';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
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

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navigation = [],
  brand = { name: 'AI Judge' },
  user,
  className = '',
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* Sidebar */}
      <div className={`hidden md:flex ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar}>
          <SidebarHeader collapsed={sidebarCollapsed}>
            <Brand href={brand.href}>
              {brand.logo}
              {!sidebarCollapsed && <span>{brand.name}</span>}
            </Brand>
          </SidebarHeader>
          
          <SidebarNav collapsed={sidebarCollapsed}>
            <SidebarNavGroup>
              {navigation.map((item, index) => (
                <SidebarNavItem
                  key={index}
                  href={item.href}
                  active={item.active}
                  icon={item.icon}
                  collapsed={sidebarCollapsed}
                >
                  {item.label}
                </SidebarNavItem>
              ))}
            </SidebarNavGroup>
          </SidebarNav>
          
          {user && (
            <SidebarFooter collapsed={sidebarCollapsed}>
              <div className="flex items-center space-x-3">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                  </div>
                )}
              </div>
            </SidebarFooter>
          )}
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header sticky>
          <HeaderContent>
            <div className="flex items-center">
              <MobileMenuToggle
                isOpen={mobileMenuOpen}
                onToggle={toggleMobileMenu}
              />
              <Brand href={brand.href} className="ml-4">
                {brand.logo}
                <span>{brand.name}</span>
              </Brand>
            </div>
            
            <Nav>
              {navigation.map((item, index) => (
                <NavItem
                  key={index}
                  href={item.href}
                  active={item.active}
                >
                  {item.label}
                </NavItem>
              ))}
            </Nav>
            
            <HeaderActions>
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">{user.name}</span>
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  {user.menu}
                </div>
              )}
            </HeaderActions>
          </HeaderContent>
        </Header>

        {/* Main Content Area */}
        <MainContent sidebarCollapsed={sidebarCollapsed}>
          <div className="flex-1 overflow-y-auto">
            <Container size="lg" padding="md">
              {children}
            </Container>
          </div>
        </MainContent>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <Sidebar>
              <SidebarHeader>
                <Brand href={brand.href}>
                  {brand.logo}
                  <span>{brand.name}</span>
                </Brand>
              </SidebarHeader>
              
              <SidebarNav>
                <SidebarNavGroup>
                  {navigation.map((item, index) => (
                    <SidebarNavItem
                      key={index}
                      href={item.href}
                      active={item.active}
                      icon={item.icon}
                    >
                      {item.label}
                    </SidebarNavItem>
                  ))}
                </SidebarNavGroup>
              </SidebarNav>
              
              {user && (
                <SidebarFooter>
                  <div className="flex items-center space-x-3">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </SidebarFooter>
              )}
            </Sidebar>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard page wrapper
export interface DashboardPageProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  children,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          {actions && (
            <div className="mt-4 sm:mt-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
