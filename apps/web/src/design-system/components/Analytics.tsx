/**
 * Analytics Component System
 * 
 * A comprehensive analytics system with charts,
 * metrics, and data visualization components.
 */

import React from 'react';
import { MetricDisplay } from './DataVisualization';

// Chart Container
export interface ChartContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  subtitle,
  loading = false,
  error,
  actions,
  className = '',
}) => {
  const containerClasses = [
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
      <div className={containerClasses}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className="text-center py-8">
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
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
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

// Simple Bar Chart
export interface SimpleBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  maxValue?: number;
  showValues?: boolean;
  className?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  maxValue,
  showValues = true,
  className = '',
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-600 truncate">
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div
              className="h-6 rounded-full transition-all duration-300"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#3B82F6',
              }}
            />
            {showValues && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {item.value}
              </div>
            )}
          </div>
          {showValues && (
            <div className="w-12 text-sm text-gray-600 text-right">
              {item.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Simple Line Chart
export interface SimpleLineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  color?: string;
  showDots?: boolean;
  className?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  color = '#3B82F6',
  showDots = true,
  className = '',
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const getY = (value: number) => {
    return ((maxValue - value) / range) * 100;
  };

  const getX = (index: number) => {
    return (index / (data.length - 1)) * 100;
  };

  const pathData = data
    .map((item, index) => {
      const x = getX(index);
      const y = getY(item.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots && data.map((item, index) => {
          const x = getX(index);
          const y = getY(item.value);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
        <span>{maxValue}</span>
        <span>{Math.round((maxValue + minValue) / 2)}</span>
        <span>{minValue}</span>
      </div>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index} className="truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Pie Chart
export interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
  showLegend?: boolean;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  showLegend = true,
  className = '',
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    currentAngle += angle;

    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const radius = size / 2 - 10;
    const centerX = size / 2;
    const centerY = size / 2;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      pathData,
      color: item.color,
      label: item.label,
      value: item.value,
      percentage: Math.round(percentage),
    };
  });

  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <div className="flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
      
      {showLegend && (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600">{segment.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {segment.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Analytics Dashboard
export interface AnalyticsDashboardProps {
  title: string;
  subtitle?: string;
  metrics: Array<{
    title: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease' | 'neutral';
    };
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  }>;
  charts: Array<{
    title: string;
    type: 'bar' | 'line' | 'pie';
    data: any;
    className?: string;
  }>;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  title,
  subtitle,
  metrics,
  charts,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricDisplay
            key={index}
            label={metric.title}
            value={metric.value}
            trend={metric.change ? {
              value: metric.change.value,
              direction: metric.change.type === 'increase' ? 'up' : metric.change.type === 'decrease' ? 'down' : 'neutral'
            } : undefined}
            color={metric.color}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <ChartContainer
            key={index}
            title={chart.title}
            className={chart.className}
          >
            {chart.type === 'bar' && (
              <SimpleBarChart data={chart.data} />
            )}
            {chart.type === 'line' && (
              <SimpleLineChart data={chart.data} />
            )}
            {chart.type === 'pie' && (
              <PieChart data={chart.data} />
            )}
          </ChartContainer>
        ))}
      </div>
    </div>
  );
};
