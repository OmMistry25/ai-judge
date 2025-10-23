/**
 * Table Component System
 * 
 * A comprehensive table system with modern design,
 * interactive features, mobile tables, and data visualization.
 */

import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, SearchIcon } from './Icon';

// Table Column Definition
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

// Table Props
export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'striped' | 'bordered' | 'hover';
  selectable?: boolean;
  selectedRowKeys?: string[];
  onRowSelect?: (selectedKeys: string[], selectedRows: T[]) => void;
  onRowClick?: (record: T, index: number) => void;
  // pagination?: {
  //   current: number;
  //   pageSize: number;
  //   total: number;
  //   onChange: (page: number, pageSize: number) => void;
  //   showSizeChanger?: boolean;
  //   showQuickJumper?: boolean;
  // };
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyText = 'No data',
  size = 'md',
  variant = 'default',
  selectable = false,
  selectedRowKeys = [],
  onRowSelect,
  onRowClick,
  // pagination,
  sortable = false,
  onSort,
  className = '',
}: TableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const variantClasses = {
    default: 'divide-y divide-gray-200',
    striped: 'divide-y divide-gray-200 [&>tbody>tr:nth-child(even)]:bg-gray-50',
    bordered: 'border border-gray-200 divide-y divide-gray-200',
    hover: 'divide-y divide-gray-200 [&>tbody>tr:hover]:bg-gray-50',
  };

  const tableClasses = [
    'min-w-full',
    'table-auto',
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');

  const handleSort = (column: string) => {
    if (!sortable) return;

    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const handleRowSelect = (record: T, checked: boolean) => {
    if (!onRowSelect) return;

    const recordKey = record.id || record.key || JSON.stringify(record);
    const newSelectedKeys = checked
      ? [...selectedRowKeys, recordKey]
      : selectedRowKeys.filter(key => key !== recordKey);
    
    const newSelectedRows = data.filter(record => {
      const key = record.id || record.key || JSON.stringify(record);
      return newSelectedKeys.includes(key);
    });

    onRowSelect(newSelectedKeys, newSelectedRows);
  };

  const isRowSelected = (record: T) => {
    const recordKey = record.id || record.key || JSON.stringify(record);
    return selectedRowKeys.includes(recordKey);
  };

  const allSelected = data.length > 0 && data.every(record => isRowSelected(record));
  const someSelected = selectedRowKeys.length > 0 && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (!onRowSelect) return;

    if (checked) {
      const allKeys = data.map(record => record.id || record.key || JSON.stringify(record));
      onRowSelect(allKeys, data);
    } else {
      onRowSelect([], []);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                } ${column.className || ''}`}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.title}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      <ChevronUpIcon
                        size="xs"
                        className={`${
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <ChevronDownIcon
                        size="xs"
                        className={`${
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, index) => (
            <tr
              key={record.id || record.key || index}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                isRowSelected(record) ? 'bg-blue-50' : ''
              }`}
              onClick={() => onRowClick?.(record, index)}
            >
              {selectable && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isRowSelected(record)}
                    onChange={(e) => handleRowSelect(record, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((column) => {
                const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                const renderedValue = column.render ? column.render(value, record, index) : value;
                
                return (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-${column.align || 'left'} ${
                      column.className || ''
                    }`}
                  >
                    {renderedValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Mobile Table for responsive design
export interface MobileTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

export const MobileTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyText = 'No data',
  className = '',
}: MobileTableProps<T>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((record, index) => (
        <div key={record.id || record.key || index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            {columns.map((column) => {
              const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
              const renderedValue = column.render ? column.render(value, record, index) : value;
              
              return (
                <div key={column.key} className="flex justify-between items-start">
                  <dt className="text-sm font-medium text-gray-500">{column.title}</dt>
                  <dd className="text-sm text-gray-900 text-right">{renderedValue}</dd>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Table with Search and Filters
export interface TableWithFiltersProps<T = any> extends TableProps<T> {
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ label: string; value: string }>;
    value?: string;
    onChange: (value: string) => void;
  }>;
}

export const TableWithFilters = <T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  filters = [],
  ...tableProps
}: TableWithFiltersProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size="sm" color="muted" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        )}
        
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <select
                key={filter.key}
                value={filter.value || ''}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <Table data={data} columns={columns} {...tableProps} />
    </div>
  );
};
