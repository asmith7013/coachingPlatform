import React from 'react';
import { Card } from '@components/composed/cards/Card';
import { Button } from '@components/core/Button';

interface FormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  className?: string;
}

/**
 * Layout wrapper for forms - handles styling and layout without form logic
 * Works with any form implementation
 */
export function FormLayout({
  title,
  description,
  children,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  canSubmit = true,
  className,
}: FormLayoutProps) {
  return (
    <Card className={className}>
      <Card.Header>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </Card.Header>

      <Card.Body>
        <fieldset disabled={isSubmitting} className="space-y-4">
          {children}
        </fieldset>
      </Card.Body>

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
              {cancelLabel}
            </Button>
          )}
          
          <Button
            type="submit"
            intent="primary"
            appearance="solid"
            loading={isSubmitting}
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
} 