'use client';

import { useMemo } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Badge } from '@/components/core/feedback/Badge';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { ImportPreview } from '@/lib/types/domain/monday';
import { cn } from '@ui/utils/formatters';

export interface MondayItemPreviewCardProps {
  preview: ImportPreview;
  isSelected: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  disabled?: boolean;
}

export function MondayItemPreviewCard({
  preview,
  isSelected,
  onToggleSelect,
  disabled = false
}: MondayItemPreviewCardProps) {
  const { original, transformed, valid, isDuplicate, missingRequired, errors } = preview;
  
  // Get status badges to display
  const statusBadges = useMemo(() => {
    const badges = [];
    
    if (valid) {
      badges.push(
        <Badge key="valid" variant="success">
          Valid
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="invalid" variant="danger">
          Invalid
        </Badge>
      );
    }
    
    if (isDuplicate) {
      badges.push(
        <Badge key="duplicate" variant="warning">
          Duplicate
        </Badge>
      );
    }
    
    if (preview.existingItem) {
      badges.push(
        <Badge key="exists" variant="info">
          Already Imported
        </Badge>
      );
    }
    
    return badges;
  }, [valid, isDuplicate, preview.existingItem]);
  
  // Format object values for display
  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Empty</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return String(value);
  };
  
  // Field validation status
  const getFieldValidationStatus = (fieldName: string) => {
    if (missingRequired.includes(fieldName)) {
      return {
        className: 'border-l-4 border-red-500 pl-2',
        message: 'Required field is missing'
      };
    }
    
    if (errors[fieldName]) {
      return {
        className: 'border-l-4 border-red-500 pl-2',
        message: errors[fieldName]
      };
    }
    
    return {
      className: '',
      message: null
    };
  };
  
  const handleToggle = () => {
    // Only allow selecting valid items
    if (!valid && !isSelected) return;
    onToggleSelect(original.id as string, !isSelected);
  };
  
  return (
    <Card className={cn("p-4", isDuplicate && "border-yellow-400")}>
      <div className="flex flex-col space-y-4">
        {/* Header with checkbox and title */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onChange={handleToggle}
              disabled={(!valid && !isSelected) || disabled}
            />
            <div>
              <Heading level="h4" className="font-medium">
                {original.name as string}
              </Heading>
              <div className="flex gap-2 mt-1">
                {statusBadges}
              </div>
            </div>
          </div>
        </div>
        
        {/* Validation errors */}
        {!valid && errors && Object.keys(errors).length > 0 && (
          <div className="bg-red-50 p-3 rounded-md border border-red-100">
            <Text className="text-red-800 font-medium mb-1">Validation Errors:</Text>
            <ul className="list-disc list-inside text-sm text-red-700">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{field}: {message}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Transformed data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(transformed).map(([field, value]) => {
            // Skip system fields
            if (field.startsWith('_') || field === 'mondayItemId' || field === 'mondayBoardId') {
              return null;
            }
            
            const { className, message } = getFieldValidationStatus(field);
            
            return (
              <div key={field} className={className}>
                <div className="text-sm font-medium text-gray-700">{field}</div>
                <div className="mt-1">{formatValue(value)}</div>
                {message && (
                  <div className="text-xs text-red-600 mt-1">{message}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
} 