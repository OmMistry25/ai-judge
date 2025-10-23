/**
 * Dashboard Component System
 * 
 * A comprehensive dashboard system with grid-based layout,
 * statistics cards, charts integration, and real-time updates.
 */

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { DataStatCard } from './DataVisualization';

// Dashboard Grid Layout
export interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const gridClasses = [
    'grid',
    columnClasses[columns],
    gapClasses[gap],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Dashboard Widget
export interface DashboardWidgetProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  children,
  title,
  subtitle,
  actions,
  loading = false,
  error,
  className = '',
}) => {
  const widgetClasses = [
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'shadow-sm',
    'p-6',
    className,
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className={widgetClasses}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={widgetClasses}>
        <div className="text-center py-8">
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={widgetClasses}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Statistics Overview
export interface StatsOverviewProps {
  stats: Array<{
    title: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease' | 'neutral';
    };
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  }>;
  className?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  className = '',
}) => {
  return (
    <DashboardGrid columns={Math.min(stats.length, 4) as 1 | 2 | 3 | 4} className={className}>
      {stats.map((stat, index) => (
        <DataStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </DashboardGrid>
  );
};

// Activity Feed
export interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    description?: string;
    timestamp: Date;
    user?: string;
  }>;
  maxItems?: number;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 10,
  className = '',
}) => {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const typeIcons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  const recentActivities = activities.slice(0, maxItems);

  return (
    <DashboardWidget
      title="Recent Activity"
      subtitle={`${activities.length} total activities`}
      className={className}
    >
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${typeClasses[activity.type]}`}
          >
            <span className="text-lg">{typeIcons[activity.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.title}</p>
              {activity.description && (
                <p className="text-sm opacity-75 mt-1">{activity.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-75">
                  {activity.timestamp.toLocaleString()}
                </span>
                {activity.user && (
                  <span className="text-xs opacity-75">by {activity.user}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

// Real-time Updates Hook
export interface UseRealTimeUpdatesOptions {
  interval?: number;
  onUpdate: () => void;
  enabled?: boolean;
}

export const useRealTimeUpdates = ({
  interval = 30000, // 30 seconds
  onUpdate,
  enabled = true,
}: UseRealTimeUpdatesOptions) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const updateInterval = setInterval(() => {
      try {
        onUpdate();
        setLastUpdate(new Date());
        setIsConnected(true);
      } catch (error) {
        console.error('Real-time update failed:', error);
        setIsConnected(false);
      }
    }, interval);

    return () => clearInterval(updateInterval);
  }, [interval, onUpdate, enabled]);

  return {
    isConnected,
    lastUpdate,
  };
};

// Dashboard Header
export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  lastUpdated?: Date;
  isLive?: boolean;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actions,
  lastUpdated,
  isLive = false,
  className = '',
}) => {
  const headerClasses = [
    'flex',
    'items-center',
    'justify-between',
    'mb-6',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleString()}
            {isLive && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Live
              </span>
            )}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </div>
  );
};

// Quick Actions
export interface QuickActionsProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className = '',
}) => {
  return (
    <DashboardWidget
      title="Quick Actions"
      className={className}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            onClick={action.onClick}
            className="justify-start"
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </DashboardWidget>
  );
};

// Analytics Dashboard Layout
export interface AnalyticsDashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const AnalyticsDashboardLayout: React.FC<AnalyticsDashboardLayoutProps> = ({
  children,
  header,
  sidebar,
  className = '',
}) => {
  const layoutClasses = [
    'min-h-screen',
    'bg-gray-50',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {header && (
        <header className="bg-white border-b border-gray-200">
          {header}
        </header>
      )}
      <div className="flex">
        {sidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
