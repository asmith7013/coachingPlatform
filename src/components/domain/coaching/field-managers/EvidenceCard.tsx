"use client";

import React from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Select } from '@/components/core/fields/Select';
import { Text } from '@/components/core/typography/Text';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { CapEvidence } from '@zod-schema/cap';

interface EvidenceCardProps {
  evidence: CapEvidence;
  onUpdate: (updates: Partial<CapEvidence>) => void;
  onRemove: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

const variantStyles = {
  default: {
    container: 'border-gray-200 bg-white',
    header: 'text-gray-700'
  },
  primary: {
    container: 'border-blue-200 bg-blue-50',
    header: 'text-blue-700'
  },
  secondary: {
    container: 'border-purple-200 bg-purple-50',
    header: 'text-purple-700'
  }
};

export function EvidenceCard({
  evidence,
  onUpdate,
  onRemove,
  variant = 'default',
  className = ''
}: EvidenceCardProps) {
  const styles = variantStyles[variant];

  const evidenceTypeOptions = [
    { value: 'written_summary', label: 'Written Summary' },
    { value: 'link', label: 'Link' },
    { value: 'document', label: 'Document' },
    { value: 'photo', label: 'Photo' },
    { value: 'video', label: 'Video' }
  ];

  return (
    <div className={`border rounded-lg p-4 mb-3 ${styles.container} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <Text textSize="sm" className={`font-medium ${styles.header}`}>
          Evidence
        </Text>
        <Button
          intent="danger"
          appearance="outline"
          textSize="sm"
          padding="sm"
          onClick={onRemove}
          className="flex items-center gap-1"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Type and Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Select
          label="Type"
          value={evidence.type}
          onChange={(value) => onUpdate({ type: value as CapEvidence['type'] })}
          options={evidenceTypeOptions}
          textSize="sm"
        />

        <Input
          label="Date Collected"
          type="date"
          value={evidence.dateCollected || ''}
          onChange={(e) => onUpdate({ dateCollected: e.target.value })}
          textSize="sm"
        />
      </div>

      {/* Title Field */}
      <Input
        label="Title"
        value={evidence.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Brief description of evidence"
        className="mb-3"
        textSize="sm"
      />

      {/* Type-Specific Content Fields */}
      {evidence.type === 'written_summary' && (
        <Textarea
          label="Content"
          value={evidence.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Written summary of the evidence..."
          rows={3}
          textSize="sm"
        />
      )}

      {evidence.type === 'link' && (
        <Input
          label="URL"
          value={evidence.url || ''}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://..."
          textSize="sm"
        />
      )}

      {(evidence.type === 'document' || evidence.type === 'photo' || evidence.type === 'video') && (
        <Input
          label="File Path"
          value={evidence.uploadedFile || ''}
          onChange={(e) => onUpdate({ uploadedFile: e.target.value })}
          placeholder="Path to uploaded file"
          textSize="sm"
        />
      )}
    </div>
  );
} 