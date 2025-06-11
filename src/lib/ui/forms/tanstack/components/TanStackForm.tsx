import React from 'react';
import { Card } from '@components/composed/cards/Card';
import { Button } from '@components/core/Button';
import { cn } from '@ui/utils/formatters';
import type { FormFieldConfig } from '../types/field-types';

/**
 * TanStack Form API interface (simplified for current needs)
 */
interface FormApi {
  state: {
    isSubmitting: boolean;
    canSubmit: boolean;
  };
  handleSubmit: () => void;
  Provider: React.ComponentType<{ children: React.ReactNode }>;
  Field: React.ComponentType<{ name: string; children: (field: FieldApi) => React.ReactNode }>;
  Subscribe: React.ComponentType<{ selector: (state: unknown) => unknown; children: (state: unknown) => React.ReactNode }>;
}

/**
 * TanStack Field API interface (simplified for current needs)
 */
interface FieldApi {
  state: {
    meta: {
      errors?: string[];
    };
  };
}

/**
 * Props for the main TanStack form component
 * Follows established component prop patterns from Card and Button
 */
export interface TanStackFormProps {
  /** TanStack Form API instance from useForm hook */
  form: FormApi;
  
  /** Field configuration array for rendering */
  fields: FormFieldConfig[];
  
  /** Form title displayed in Card header */
  title: string;
  
  /** Optional form description */
  description?: string;
  
  /** Submit button text */
  submitLabel?: string;
  
  /** Cancel button text and handler */
  cancelLabel?: string;
  onCancel?: () => void;
  
  /** Loading state override */
  loading?: boolean;
  
  /** Custom form layout content (overrides default field rendering) */
  children?: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main TanStack form component
 * Uses Card component for consistent layout and integrates with TanStack Form
 * Supports both default field rendering and custom children
 * 
 * @example
 * ```tsx
 * // With default field rendering
 * <TanStackForm
 *   form={form}
 *   fields={fieldConfig}
 *   title="Create User"
 *   submitLabel="Create"
 * />
 * 
 * // With custom children
 * <TanStackForm form={form} fields={[]} title="Custom Form">
 *   <form.Field name="email">
 *     {(field) => <Input {...field} />}
 *   </form.Field>
 * </TanStackForm>
 * ```
 */
export function TanStackForm({
  form,
  fields,
  title,
  description,
  submitLabel = 'Submit',
  cancelLabel,
  onCancel,
  loading,
  children,
  className,
}: TanStackFormProps) {
  // Determine if form is submitting from form state or loading override
  const isSubmitting = loading ?? form.state.isSubmitting;
  
  // Determine if form can be submitted
  const canSubmit = form.state.canSubmit && !isSubmitting;

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      {/* Form Header */}
      <Card.Header>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </Card.Header>

      {/* Form Body */}
      <Card.Body>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Form Provider Context */}
          <form.Provider>
            <fieldset disabled={isSubmitting} className="space-y-4">
              {children ? (
                // Custom children take precedence
                children
              ) : (
                // Default field rendering (placeholder for now)
                <div className="space-y-4">
                  {fields.map((field: FormFieldConfig) => (
                    <div key={field.name} className="space-y-2">
                      <label 
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      
                      <form.Field name={field.name}>
                        {(fieldApi: FieldApi) => (
                          <div className="space-y-1">
                            {/* Placeholder for field renderer - will be implemented in next sub-task */}
                            <div className="min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm">
                              Field: {field.name} (Type: {field.type})
                            </div>
                            
                            {/* Error display */}
                            {fieldApi.state.meta.errors && (
                              <p className="text-sm text-destructive">
                                {fieldApi.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>
                    </div>
                  ))}
                </div>
              )}
            </fieldset>
          </form.Provider>
        </form>
      </Card.Body>

      {/* Form Footer with Actions */}
      <Card.Footer>
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              intent="secondary"
              appearance="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelLabel || 'Cancel'}
            </Button>
          )}
          
          <Button
            type="submit"
            intent="primary"
            appearance="solid"
            loading={isSubmitting}
            disabled={!canSubmit}
            onClick={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}

/**
 * Form state subscription component for accessing form state outside the form
 * Useful for showing form status or implementing custom submit buttons
 * 
 * @example
 * ```tsx
 * <TanStackFormState form={form}>
 *   {(state) => (
 *     <div>
 *       Form submitting: {String(state.isSubmitting)}
 *     </div>
 *   )}
 * </TanStackFormState>
 * ```
 */
export function TanStackFormState({
  form,
  children,
}: {
  form: FormApi;
  children: (state: FormApi['state']) => React.ReactNode;
}) {
  return (
    <form.Subscribe
      selector={(state: unknown) => state as FormApi['state']}
    >
      {(state: unknown) => children(state as FormApi['state'])}
    </form.Subscribe>
  );
}

/**
 * Fieldset wrapper for form sections
 * Automatically disables all form elements when form is submitting
 */
export function TanStackFormFieldset({
  form,
  children,
  className,
}: {
  form: FormApi;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset 
      disabled={form.state.isSubmitting} 
      className={cn('space-y-4', className)}
    >
      {children}
    </fieldset>
  );
}

export default TanStackForm; 