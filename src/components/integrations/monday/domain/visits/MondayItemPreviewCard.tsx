'use client';

import { useMemo } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Badge } from '@/components/core/feedback/Badge';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import ReferenceSelect from '@/components/core/fields/ReferenceSelect';
import { ImportPreview } from '@lib/integrations/monday/types/import';
import { cn } from '@ui/utils/formatters';
import { useState } from 'react';
import { formatMediumDate, toDateString } from '@transformers/utils/date-utils';

export interface MondayItemPreviewCardProps {
  preview: ImportPreview;
  isSelected: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  onOwnerSelected?: (id: string, ownerId: string) => void;
  disabled?: boolean;
}

// Component for selecting an owner when one isn't found automatically
function OwnerSelector({ 
  itemId, 
  onOwnerSelected 
}: { 
  itemId: string; 
  onOwnerSelected?: (id: string, ownerId: string) => void 
}) {
  const [selectedOwner, setSelectedOwner] = useState("");
  
  if (!onOwnerSelected) return null;
  
  return (
    <div className="border-l-4 border-yellow-400 pl-4 py-2 mt-4">
      <Text className="text-sm font-medium mb-2">Select an owner for this visit</Text>
      <div className="flex gap-2">
        <ReferenceSelect
          label=""
          value={selectedOwner}
          onChange={(value) => setSelectedOwner(Array.isArray(value) ? value[0] : value)}
          url="/api/reference/staff"
          multiple={false}
        />
        <Button
          appearance="solid"
          intent="primary"
          onClick={() => onOwnerSelected(itemId, selectedOwner)}
          disabled={!selectedOwner}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

export function MondayItemPreviewCard({
  preview,
  isSelected,
  onToggleSelect,
  onOwnerSelected,
  disabled = false
}: MondayItemPreviewCardProps) {
  const { original, transformed, valid, isDuplicate, missingRequired, errors } = preview;
  
  // Check if this item needs an owner
  const needsOwner = missingRequired.includes('owners');
  
  // Check if an owner has been auto-assigned from coach
  const hasAutoAssignedOwner = !needsOwner && 
                              transformed.coach && 
                              Array.isArray(transformed.owners) &&
                              transformed.owners.length === 1 && 
                              transformed.owners[0] === transformed.coach;
  
  // Get status badges to display
  const statusBadges = useMemo(() => {
    const badges = [];
    
    if (valid) {
      badges.push(
        <Badge key="valid" intent="success">
          Valid
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="invalid" intent="danger">
          Invalid
        </Badge>
      );
    } 
    
    if (isDuplicate) {
      badges.push(
        <Badge key="duplicate" intent="warning">
          Duplicate
        </Badge>
      );
    }
    
    if (preview.existingItem) {
      badges.push(
        <Badge key="exists" intent="info">
          Already Imported
        </Badge>
      );
    }
    
    // Add badge for missing owner
    if (needsOwner) {
      badges.push(
        <Badge key="missing-owner" intent="warning">
          Needs Owner
        </Badge>
      );
    }
    
    // Add badge for auto-assigned owner
    if (hasAutoAssignedOwner) {
      badges.push(
        <Badge key="auto-assigned" intent="info">
          Coach as Owner
        </Badge>
      );
    }
    
    return badges;
  }, [valid, isDuplicate, preview.existingItem, needsOwner, hasAutoAssignedOwner]);
  
  // Format object values for display
  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Empty</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value instanceof Date) {
      return formatMediumDate(toDateString(value));
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
    // Only allow selecting valid items or ones that just need an owner
    const isSelectableWithOwner = !valid && needsOwner && missingRequired.length === 1;
    if (!valid && !isSelected && !isSelectableWithOwner) return;
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
              disabled={((!valid && !needsOwner) && !isSelected) || disabled}
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
        
        {/* Owner selection for items missing owners */}
        {needsOwner && onOwnerSelected && (
          <OwnerSelector 
            itemId={original.id as string} 
            onOwnerSelected={onOwnerSelected} 
          />
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