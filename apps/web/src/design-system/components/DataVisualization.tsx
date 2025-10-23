/**
 * Data Visualization Component System
 * 
 * A comprehensive data visualization system with
 * charts, graphs, and interactive data displays.
 */

import React from 'react';
// import { Badge } from './Badge';

// Progress Bar Component
export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  label,
  className = '',
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-500',
  };

  const progressClasses = [
    'w-full',
    'bg-gray-200',
    'rounded-full',
    'overflow-hidden',
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  const barClasses = [
    'h-full',
    'transition-all',
    'duration-300',
    'ease-in-out',
    variantClasses[variant],
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{label || 'Progress'}</span>
          <span className="text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={progressClasses}>
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Data Stat Card Component
export interface DataStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
}

export const DataStatCard: React.FC<DataStatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  className = '',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  const changeClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const cardClasses = [
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'p-6',
    'shadow-sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center text-sm ${changeClasses[change.type]}`}>
              <span className="mr-1">
                {change.type === 'increase' ? '↗' : change.type === 'decrease' ? '↘' : '→'}
              </span>
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Data Table with Actions
export interface DataTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    dataIndex?: keyof T;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
  }>;
  actions?: Array<{
    label: string;
    onClick: (record: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
  }>;
  bulkActions?: Array<{
    label: string;
    onClick: (selectedRecords: T[]) => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  bulkActions = [],
  className = '',
}: DataTableProps<T>) => {
  const [selectedRows, setSelectedRows] = React.useState<T[]>([]);

  const handleRowSelect = (record: T, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, record]);
    } else {
      setSelectedRows(prev => prev.filter(row => row !== record));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data);
    } else {
      setSelectedRows([]);
    }
  };

  const isRowSelected = (record: T) => selectedRows.includes(record);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bulk Actions */}
      {bulkActions.length > 0 && selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick(selectedRows)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    action.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : action.variant === 'secondary'
                      ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isRowSelected(record)}
                    onChange={(e) => handleRowSelect(record, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                {columns.map((column) => {
                  const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                  const renderedValue = column.render ? column.render(value, record, index) : value;
                  
                  return (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderedValue}
                    </td>
                  );
                })}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(record)}
                          className={`text-sm font-medium transition-colors ${
                            action.variant === 'danger'
                              ? 'text-red-600 hover:text-red-900'
                              : action.variant === 'secondary'
                              ? 'text-gray-600 hover:text-gray-900'
                              : 'text-blue-600 hover:text-blue-900'
                          }`}
                        >
                          {action.icon && <span className="mr-1">{action.icon}</span>}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Metric Display Component
export interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  unit,
  trend,
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const metricClasses = [
    'text-center',
    'p-4',
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'shadow-sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={metricClasses}>
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <p className={`font-bold ${sizeClasses[size]} ${colorClasses[color]}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
      {trend && (
        <div className={`flex items-center justify-center text-sm ${trendClasses[trend.direction]}`}>
          <span className="mr-1">
            {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
          </span>
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};

// Data Summary Component
export interface DataSummaryProps {
  title: string;
  data: Array<{
    label: string;
    value: string | number;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  }>;
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

export const DataSummary: React.FC<DataSummaryProps> = ({
  title,
  data,
  layout = 'horizontal',
  className = '',
}) => {
  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-4',
    vertical: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  };

  const summaryClasses = [
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'p-6',
    'shadow-sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={summaryClasses}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className={layoutClasses[layout]}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              item.color === 'blue' ? 'bg-blue-500' :
              item.color === 'green' ? 'bg-green-500' :
              item.color === 'yellow' ? 'bg-yellow-500' :
              item.color === 'red' ? 'bg-red-500' :
              item.color === 'purple' ? 'bg-purple-500' :
              'bg-gray-500'
            }`} />
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
