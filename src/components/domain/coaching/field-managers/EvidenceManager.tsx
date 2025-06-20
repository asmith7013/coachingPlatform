"use client";

import React from 'react';
import { Button } from '@/components/core/Button';
import { Text } from '@/components/core/typography/Text';
import { PlusIcon } from '@heroicons/react/24/outline';
import { EvidenceCard } from './EvidenceCard';
import type { CapEvidence } from '@zod-schema/cap';
import { getTodayString } from '@data-processing/transformers/utils/date-utils';

interface EvidenceManagerProps {
  label: string;
  evidence: CapEvidence[];
  onChange: (evidence: CapEvidence[]) => void;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  minItems?: number;
  maxItems?: number;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
}

const variantStyles = {
  default: {
    label: 'text-gray-700',
    container: 'border-gray-200',
    button: 'border-gray-300'
  },
  primary: {
    label: 'text-blue-700',
    container: 'border-blue-200 bg-blue-50',
    button: 'border-blue-300'
  },
  secondary: {
    label: 'text-purple-700',
    container: 'border-purple-200 bg-purple-50',
    button: 'border-purple-300'
  },
  success: {
    label: 'text-green-700',
    container: 'border-green-200 bg-green-50',
    button: 'border-green-300'
  },
  warning: {
    label: 'text-orange-700',
    container: 'border-orange-200 bg-orange-50',
    button: 'border-orange-300'
  },
  danger: {
    label: 'text-red-700',
    container: 'border-red-200 bg-red-50',
    button: 'border-red-300'
  },
  info: {
    label: 'text-blue-700',
    container: 'border-blue-200 bg-blue-50',
    button: 'border-blue-300'
  }
};

export function EvidenceManager({
  label,
  evidence,
  onChange,
  variant = 'default',
  className = '',
  minItems = 0,
  maxItems = 10,
  placeholder = "Add supporting evidence...",
  helpText,
  required = false
}: EvidenceManagerProps) {
  const styles = variantStyles[variant];

  const addEvidence = () => {
    if (!maxItems || evidence.length < maxItems) {
      const newEvidence: CapEvidence = {
        _id: '',
        ownerIds: [],
        visitId: '',
        description: '',
        type: 'written_summary',
        title: '',
        content: '',
        url: '',
        uploadedFile: '',
        dateCollected: getTodayString()
      };
      onChange([...evidence, newEvidence]);
    }
  };

  const updateEvidence = (index: number, updates: Partial<CapEvidence>) => {
    const updated = [...evidence];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeEvidence = (index: number) => {
    if (evidence.length > minItems) {
      onChange(evidence.filter((_, i) => i !== index));
    }
  };

  const canAdd = !maxItems || evidence.length < maxItems;
  const canRemove = evidence.length > minItems;

  // Determine card variant based on manager variant
  const getCardVariant = (): 'default' | 'primary' | 'secondary' => {
    switch (variant) {
      case 'primary':
      case 'info':
        return 'primary';
      case 'secondary':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text 
          textSize="sm" 
          color="default" 
          className={`font-medium ${styles.label}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Text>
        
        {canAdd && (
          <Button
            intent="secondary"
            appearance="outline"
            textSize="sm"
            padding="sm"
            onClick={addEvidence}
            className={`flex items-center gap-2 ${styles.button}`}
          >
            <PlusIcon className="h-4 w-4" />
            Add Evidence
          </Button>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <Text textSize="sm" color="muted" className="mt-1">
          {helpText}
        </Text>
      )}

      {/* Evidence Container */}
      <div className={`space-y-3 p-3 rounded-md border ${styles.container}`}>
        {evidence.length === 0 ? (
          <Text textSize="sm" color="muted" className="italic text-center py-6">
            {placeholder}
          </Text>
        ) : (
          evidence.map((evidenceItem, index) => (
            <EvidenceCard
              key={index}
              evidence={evidenceItem}
              onUpdate={(updates) => updateEvidence(index, updates)}
              onRemove={canRemove ? () => removeEvidence(index) : () => {}}
              variant={getCardVariant()}
            />
          ))
        )}
      </div>

      {/* Evidence Count */}
      {maxItems && (
        <Text textSize="xs" color="muted" className="text-right">
          {evidence.length} / {maxItems} evidence items
        </Text>
      )}
    </div>
  );
}