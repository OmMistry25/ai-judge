/**
 * Card Component System
 * 
 * A flexible card system with headers, content, and actions
 * for displaying grouped information.
 */

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const cardClasses = [
    'rounded-lg',
    'transition-shadow',
    'hover:shadow-sm',
    variantClasses[variant],
    paddingClasses[padding],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

// Card Header
export interface CardHeaderProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-200 pb-4 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="ml-4 flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Card Body
export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`border-t border-gray-200 pt-4 ${className}`}>
      {children}
    </div>
  );
};

// Stat Card for displaying metrics
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  className = '',
}) => {
  const changeClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card className={className}>
      <div className="flex items-center">
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeClasses[change.type]}`}>
              {change.type === 'increase' && '+'}
              {change.value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Feature Card for highlighting features
export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <Card className={`text-center ${className}`}>
      {icon && (
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </Card>
  );
};

// Product Card for displaying products/items
export interface ProductCardProps {
  title: string;
  description?: string;
  image?: string;
  price?: string;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  image,
  price,
  badge,
  action,
  className = '',
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {image && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      {badge && (
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {badge}
          </span>
        </div>
      )}
      <CardBody>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        {price && (
          <p className="text-xl font-bold text-gray-900 mb-4">{price}</p>
        )}
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
