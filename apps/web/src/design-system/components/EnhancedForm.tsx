/**
 * Enhanced Form Component System
 * 
 * A comprehensive form system with modern layout,
 * validation feedback, form groups, and auto-save functionality.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, IconButton } from './Button';
import { CheckIcon, XIcon } from './Icon';

// Form Field Wrapper with enhanced validation
export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  success?: boolean;
  warning?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  required = false,
  error,
  helpText,
  success = false,
  warning,
  className = '',
}) => {
  const fieldClasses = [
    'space-y-1',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={fieldClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckIcon size="sm" color="success" />
          </div>
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <XIcon size="sm" color="error" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
      {warning && !error && (
        <p className="text-sm text-yellow-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {warning}
        </p>
      )}
      {helpText && !error && !warning && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Enhanced Form Group for organizing related fields
export interface EnhancedFormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export const EnhancedFormGroup: React.FC<EnhancedFormGroupProps> = ({
  children,
  title,
  description,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const groupClasses = [
    'space-y-4',
    'p-4',
    'border',
    'border-gray-200',
    'rounded-lg',
    'bg-gray-50',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses}>
      {(title || description) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <IconButton
              icon={collapsed ? '▼' : '▲'}
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            />
          )}
        </div>
      )}
      {!collapsed && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Enhanced Input with validation states
export interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: boolean;
  warning?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  required?: boolean;
  className?: string;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  success = false,
  warning,
  helpText,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  required = false,
  className = '',
  ...props
}) => {
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

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
    : warning
    ? 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
    : '';

  const inputClasses = [
    'block',
    'w-full',
    'rounded-md',
    'border',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-1',
    ...variantClasses[variant],
    stateClasses,
    sizeClasses[size],
    leftIcon ? 'pl-10' : '',
    (rightIcon || success || error) ? 'pr-10' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      success={success}
      warning={warning}
    >
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        <input className={inputClasses} {...props} />
        {rightIcon && !success && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
    </FormField>
  );
};

// Auto-save functionality hook
export interface UseAutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useAutoSave = (
  data: any,
  options: UseAutoSaveOptions
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { delay = 2000, onSave, onError, onSuccess } = options;

  const save = useCallback(async () => {
    if (!data) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(data);
      setLastSaved(new Date());
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave, onError, onSuccess]);

  useEffect(() => {
    const timeoutId = setTimeout(save, delay);
    return () => clearTimeout(timeoutId);
  }, [save, delay]);

  return {
    isSaving,
    lastSaved,
    error,
    save,
  };
};

// Form with auto-save
export interface AutoSaveFormProps {
  children: React.ReactNode;
  data: any;
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  saveDelay?: number;
  showStatus?: boolean;
  className?: string;
}

export const AutoSaveForm: React.FC<AutoSaveFormProps> = ({
  children,
  data,
  onSave,
  onError,
  onSuccess,
  saveDelay = 2000,
  showStatus = true,
  className = '',
}) => {
  const { isSaving, lastSaved, error, save } = useAutoSave(data, {
    delay: saveDelay,
    onSave,
    onError,
    onSuccess,
  });

  const formClasses = [
    'space-y-6',
    className,
  ].filter(Boolean).join(' ');

  return (
    <form className={formClasses}>
      {children}
      {showStatus && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {isSaving && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                Saving...
              </div>
            )}
            {lastSaved && !isSaving && (
              <div className="flex items-center text-sm text-green-600">
                <CheckIcon size="sm" className="mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {error && (
              <div className="flex items-center text-sm text-red-600">
                <XIcon size="sm" className="mr-1" />
                {error}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={save}
              disabled={isSaving}
              leftIcon={<span>💾</span>}
            >
              Save Now
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

// Form validation hook
export interface UseFormValidationOptions {
  initialValues: Record<string, any>;
  validationSchema?: Record<string, (value: any) => string | null>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
}

export const useFormValidation = ({
  initialValues,
  validationSchema = {},
  onSubmit,
}: UseFormValidationOptions) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldName: string, value: any) => {
    const validator = validationSchema[fieldName];
    if (!validator) return null;
    return validator(value);
  }, [validationSchema]);

  const validateAll = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validate, validationSchema]);

  const handleChange = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validate(fieldName, values[fieldName]);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, onSubmit, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
    setTouched,
  };
};
