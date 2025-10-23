/**
 * Form Validation Component System
 * 
 * A comprehensive form validation system with
 * real-time validation, error handling, and user feedback.
 */

import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon } from './Icon';
import { Badge } from './Badge';

// Validation Rule Types
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
};

export type ValidationRules = Record<string, ValidationRule>;

// Validation Hook
export interface UseValidationOptions {
  rules: ValidationRules;
  initialValues?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useValidation = ({
  rules,
  initialValues = {},
  validateOnChange = true,
  validateOnBlur = true,
}: UseValidationOptions) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (fieldName: string, value: any): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${fieldName} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') return null;

    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return rule.message || `${fieldName} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        valid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(valid);
    return valid;
  };

  const handleChange = (fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    if (validateOnChange) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (validateOnBlur) {
      const error = validateField(fieldName, values[fieldName]);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  };

  useEffect(() => {
    validateAll();
  }, [values]);

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
    setErrors,
    setTouched,
  };
};

// Validation Message Component
export interface ValidationMessageProps {
  error?: string;
  success?: boolean;
  warning?: string;
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  error,
  success = false,
  warning,
  className = '',
}) => {
  if (!error && !success && !warning) return null;

  const messageClasses = [
    'flex',
    'items-center',
    'text-sm',
    'mt-1',
    className,
  ].filter(Boolean).join(' ');

  const getMessageContent = () => {
    if (error) {
      return (
        <>
          <span className="mr-1">⚠️</span>
          <span className="text-red-600">{error}</span>
        </>
      );
    }
    
    if (warning) {
      return (
        <>
          <span className="mr-1">⚠️</span>
          <span className="text-yellow-600">{warning}</span>
        </>
      );
    }
    
    if (success) {
      return (
        <>
          <CheckIcon size="sm" color="success" className="mr-1" />
          <span className="text-green-600">Valid</span>
        </>
      );
    }
    
    return null;
  };

  return <div className={messageClasses}>{getMessageContent()}</div>;
};

// Form Error Summary
export interface FormErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
  className?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  title = 'Please fix the following errors:',
  className = '',
}) => {
  const errorEntries = Object.entries(errors).filter(([_, message]) => message);

  if (errorEntries.length === 0) return null;

  const summaryClasses = [
    'bg-red-50',
    'border',
    'border-red-200',
    'rounded-md',
    'p-4',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={summaryClasses}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XIcon size="md" color="error" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errorEntries.map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Field Validation Status
export interface FieldValidationStatusProps {
  fieldName: string;
  error?: string;
  touched?: boolean;
  className?: string;
}

export const FieldValidationStatus: React.FC<FieldValidationStatusProps> = ({
  error,
  touched = false,
  className = '',
}) => {
  if (!touched) return null;

  const statusClasses = [
    'flex',
    'items-center',
    'text-xs',
    'mt-1',
    className,
  ].filter(Boolean).join(' ');

  if (error) {
    return (
      <div className={statusClasses}>
        <XIcon size="xs" color="error" className="mr-1" />
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className={statusClasses}>
      <CheckIcon size="xs" color="success" className="mr-1" />
      <span className="text-green-600">Valid</span>
    </div>
  );
};

// Form Validation Badge
export interface ValidationBadgeProps {
  isValid: boolean;
  hasErrors: boolean;
  className?: string;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({
  isValid,
  hasErrors,
  className = '',
}) => {
  if (isValid) {
    return (
      <Badge variant="success" size="sm" className={className}>
        <CheckIcon size="xs" className="mr-1" />
        Valid
      </Badge>
    );
  }

  if (hasErrors) {
    return (
      <Badge variant="error" size="sm" className={className}>
        <XIcon size="xs" className="mr-1" />
        Invalid
      </Badge>
    );
  }

  return null;
};

// Real-time Validation Indicator
export interface ValidationIndicatorProps {
  isValidating: boolean;
  isValid: boolean;
  hasErrors: boolean;
  className?: string;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  isValidating,
  isValid,
  hasErrors,
  className = '',
}) => {
  const indicatorClasses = [
    'flex',
    'items-center',
    'text-sm',
    'text-gray-500',
    className,
  ].filter(Boolean).join(' ');

  if (isValidating) {
    return (
      <div className={indicatorClasses}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
        Validating...
      </div>
    );
  }

  if (isValid) {
    return (
      <div className={indicatorClasses}>
        <CheckIcon size="sm" color="success" className="mr-1" />
        All fields are valid
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className={indicatorClasses}>
        <XIcon size="sm" color="error" className="mr-1" />
        Please fix the errors above
      </div>
    );
  }

  return null;
};
