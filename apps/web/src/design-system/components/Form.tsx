/**
 * Form Component System
 * 
 * A comprehensive form system with input components,
 * validation, and accessibility features.
 */

import React from 'react';

// Base Input Component
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    default: [
      'border-gray-300',
      'focus:border-blue-500',
      'focus:ring-blue-500',
    ],
    filled: [
      'bg-gray-100',
      'border-gray-300',
      'focus:bg-white',
      'focus:border-blue-500',
      'focus:ring-blue-500',
    ],
    outlined: [
      'border-2',
      'border-gray-300',
      'focus:border-blue-500',
      'focus:ring-blue-500',
    ],
  };

  const inputClasses = [
    'block',
    'w-full',
    'rounded-md',
    'border',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-1',
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
    ...variantClasses[variant],
    ...sizeClasses[size],
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helpText,
  size = 'md',
  resize = 'vertical',
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const textareaClasses = [
    'block',
    'w-full',
    'rounded-md',
    'border',
    'border-gray-300',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-1',
    'focus:border-blue-500',
    'focus:ring-blue-500',
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
    ...sizeClasses[size],
    resizeClasses[resize],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Select Component
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helpText,
  options,
  placeholder,
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const selectClasses = [
    'block',
    'w-full',
    'rounded-md',
    'border',
    'border-gray-300',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-1',
    'focus:border-blue-500',
    'focus:ring-blue-500',
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
    ...sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Checkbox Component
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helpText,
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const checkboxClasses = [
    'rounded',
    'border-gray-300',
    'text-blue-600',
    'focus:ring-blue-500',
    error ? 'border-red-300' : '',
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={checkboxClasses}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="ml-2 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Radio Component
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  error,
  helpText,
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const radioClasses = [
    'rounded-full',
    'border-gray-300',
    'text-blue-600',
    'focus:ring-blue-500',
    error ? 'border-red-300' : '',
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          id={radioId}
          type="radio"
          className={radioClasses}
          {...props}
        />
        {label && (
          <label htmlFor={radioId} className="ml-2 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Form Group for organizing related fields
export interface FormGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  label,
  error,
  helpText,
  required = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
