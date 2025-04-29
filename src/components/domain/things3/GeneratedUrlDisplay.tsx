import React from 'react';
import { FormSection } from '@/components/composed/forms/FormSection';

interface GeneratedUrlDisplayProps {
  url: string;
}

export function GeneratedUrlDisplay({ url }: GeneratedUrlDisplayProps) {
  if (!url) return null;
  
  return (
    <FormSection title="Generated URL">
      <div className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
        <code className="break-all">{url}</code>
      </div>
    </FormSection>
  );
} 