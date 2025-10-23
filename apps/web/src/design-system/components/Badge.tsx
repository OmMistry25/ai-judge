/**
 * Badge Component System
 * 
 * A flexible badge system for displaying status,
 * counts, and labels with various styles.
 */

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const shapeClasses = {
    rounded: 'rounded',
    pill: 'rounded-full',
    square: 'rounded-none',
  };

  const badgeClasses = [
    'inline-flex',
    'items-center',
    'font-medium',
    variantClasses[variant],
    sizeClasses[size],
    shapeClasses[shape],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

// Status Badge for displaying status
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'cancelled';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const },
    inactive: { label: 'Inactive', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    failed: { label: 'Failed', variant: 'error' as const },
    cancelled: { label: 'Cancelled', variant: 'default' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Count Badge for displaying numbers
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showZero?: boolean;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max,
  variant = 'primary',
  size = 'sm',
  showZero = false,
  className = '',
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = max && count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant={variant}
      size={size}
      shape="pill"
      className={className}
    >
      {displayCount}
    </Badge>
  );
};

// Dot Badge for simple indicators
export interface DotBadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const DotBadge: React.FC<DotBadgeProps> = ({
  variant = 'primary',
  size = 'sm',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-gray-400',
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const sizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const dotClasses = [
    'inline-block',
    'rounded-full',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={dotClasses} />
  );
};

// Notification Badge for alerts
export interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showZero?: boolean;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max,
  variant = 'error',
  size = 'sm',
  showZero = false,
  className = '',
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = max && count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant={variant}
      size={size}
      shape="pill"
      className={`absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

// Badge Group for related badges
export interface BadgeGroupProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  spacing = 'sm',
  className = '',
}) => {
  const spacingClasses = {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-3',
    lg: 'space-x-4',
  };

  const groupClasses = [
    'inline-flex',
    'items-center',
    spacingClasses[spacing],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};
