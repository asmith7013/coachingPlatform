'use client';

import { Select } from '@/components/core/fields/Select';
import { stack } from '@ui-tokens/tokens';
import { cn } from '@ui/utils/formatters';;

export const domainOptions = [
  { value: 'C1', label: 'C1: Creating a Culture of Learning' },
  { value: 'C2', label: 'C2: Facilitating Instruction' },
  { value: 'C3', label: 'C3: Student Engagement' },
];

interface Props {
  selectedDomain: string;
  onChange: (value: string) => void;
}

export function RubricFilterPanel({ selectedDomain, onChange }: Props) {
  return (
    <div className={cn(stack.md)}>
      <Select
        label="Select Domain"
        value={selectedDomain}
        onChange={onChange}
        options={domainOptions}
      />
    </div>
  );
} 