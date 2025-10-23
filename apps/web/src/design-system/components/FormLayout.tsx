/**
 * Form Layout Component System
 * 
 * A comprehensive form layout system for organizing
 * complex forms with proper spacing and visual hierarchy.
 */

import React from 'react';
import { Button } from './Button';
// import { FormGroup } from './EnhancedForm';

// Form Layout Container
export interface FormLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="space-y-8">
        {children}
      </div>
      
      {actions && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
};

// Form Section for grouping related fields
export interface FormSectionProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  required?: boolean;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  collapsible = false,
  defaultCollapsed = false,
  required = false,
  className = '',
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const sectionClasses = [
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'p-6',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={sectionClasses}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand section' : 'Collapse section'}
          >
            {collapsed ? '▼' : '▲'}
          </Button>
        )}
      </div>
      
      {!collapsed && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Form Grid for responsive form layouts
export interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className = '',
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
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

// Form Field Row for horizontal field layouts
export interface FormFieldRowProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export const FormFieldRow: React.FC<FormFieldRowProps> = ({
  children,
  label,
  required = false,
  error,
  helpText,
  className = '',
}) => {
  const rowClasses = [
    'grid',
    'grid-cols-1',
    'md:grid-cols-3',
    'gap-4',
    'items-start',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClasses}>
      {label && (
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}
      <div className={`${label ? 'md:col-span-2' : 'md:col-span-3'}`}>
        {children}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    </div>
  );
};

// Form Actions for form buttons
export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className = '',
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  const actionsClasses = [
    'flex',
    'items-center',
    'space-x-3',
    alignClasses[align],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={actionsClasses}>
      {children}
    </div>
  );
};

// Form Progress for multi-step forms
export interface FormProgressProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    completed?: boolean;
    current?: boolean;
  }>;
  className?: string;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  className = '',
}) => {
  const progressClasses = [
    'space-y-4',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={progressClasses}>
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed
                    ? 'bg-green-600 text-white'
                    : step.current
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  step.current ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="ml-4 w-8 h-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Form Wizard for step-by-step forms
export interface FormWizardProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  className?: string;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onFinish,
  canGoNext = true,
  canGoPrevious = true,
  className = '',
}) => {
  const wizardClasses = [
    'space-y-6',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wizardClasses}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-96">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious || currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-3">
          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={onNext}
              disabled={!canGoNext}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onFinish}
              disabled={!canGoNext}
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
