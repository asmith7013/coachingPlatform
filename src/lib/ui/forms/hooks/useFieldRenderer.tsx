import React from 'react';
import type { Field } from '@ui-types/form';
import type { AnyFieldApi } from '@tanstack/react-form';
import { Input } from '@components/core/fields/Input';
import { Select } from '@components/core/fields/Select';
import { Textarea } from '@components/core/fields/Textarea';
import { ReferenceSelect } from '@components/core/fields/ReferenceSelect';

/**
 * Hook that renders fields based on field configuration
 * Maintains type safety while providing consistent field rendering
 */
export function useFieldRenderer<T extends Record<string, unknown>>() {
  const renderField = (field: Field<T>, fieldApi: AnyFieldApi) => {
    const commonProps = {
      id: String(field.name),
      disabled: field.disabled || fieldApi.state.meta.isValidating,
      placeholder: field.placeholder,
    };

    const hasError = fieldApi.state.meta.errors?.length > 0;
    const errorMessage = hasError ? fieldApi.state.meta.errors[0] : undefined;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <div className="space-y-1">
            <Input
              type={field.type}
              value={fieldApi.state.value || ''}
              onChange={(e) => fieldApi.handleChange(e.target.value)}
              onBlur={fieldApi.handleBlur}
              {...commonProps}
              className={hasError ? 'border-destructive' : ''}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-1">
            <Select
              value={fieldApi.state.value}
              onChange={fieldApi.handleChange}
              options={field.options || []}
              {...commonProps}
              className={hasError ? 'border-destructive' : ''}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-1">
            <Textarea
              value={fieldApi.state.value || ''}
              onChange={(e) => fieldApi.handleChange(e.target.value)}
              onBlur={fieldApi.handleBlur}
              {...commonProps}
              className={hasError ? 'border-destructive' : ''}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case 'reference':
        return (
          <div className="space-y-1">
            <ReferenceSelect
              url={field.url || ''}
              value={fieldApi.state.value || (field.multiple ? [] : '')}
              onChange={fieldApi.handleChange}
              onBlur={fieldApi.handleBlur}
              multiple={field.multiple}
              label={field.label}
              disabled={field.disabled || fieldApi.state.meta.isValidating}
              error={hasError}
              placeholder={field.placeholder}
              entityType={field.entityType}
              className={hasError ? 'border-destructive' : ''}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return { renderField };
} 