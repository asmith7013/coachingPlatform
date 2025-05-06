'use client';

import { Card } from '@/components/composed/cards/Card';
import { Select } from '@/components/core/fields/Select';

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
    <Card padding="lg" radius="xl" variant="secondary">
      <Select
        label="Select Domain"
        value={selectedDomain}
        onChange={onChange}
        labelColor="white"
        options={domainOptions}
      />
    </Card>
  );
} 