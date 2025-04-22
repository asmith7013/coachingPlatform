'use client';

import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@/lib/utils/general';

export type PerformanceLevelKey = 'not_observed' | 'not_yet' | 'developing' | 'proficient' | 'advanced';

export const performanceLevels = [
  { key: 'not_observed' as const, label: 'Not Observed', colorClass: 'text-text-muted' },
  { key: 'not_yet' as const, label: 'Not Yet', colorClass: 'text-danger' },
  { key: 'developing' as const, label: 'Developing', colorClass: 'text-text' },
  { key: 'proficient' as const, label: 'Proficient', colorClass: 'text-success' },
  { key: 'advanced' as const, label: 'Advanced', colorClass: 'text-primary' },
];

export interface RubricIndicator {
  id: string;
  title: string;
  advanced: string[];
  proficient: string[];
  developing: string[];
  not_yet: string[];
  not_observed: string[];
}

interface Props {
  domain: RubricIndicator;
  selectedIndicators: Set<string>;
}

export function RubricCard({ domain, selectedIndicators: _selectedIndicators }: Props) {
  return (
    <Card padding="lg" radius="xl">
      <Heading 
        level="h4"
        color="default"
        className={cn("mb-4", "text-primary", "font-medium")}
      >
        {domain.title}
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {performanceLevels.map(({ key, label, colorClass }) => (
          <div key={key} className="flex flex-col">
            <div className={cn(
              "p-3 rounded-lg mb-4",
              'bg-surface',
              colorClass
            )}>
              <Text weight="medium" className="text-center">
                {label}
              </Text>
            </div>
            <ul className="space-y-3">
              {domain[key].map((text, i) => (
                <li key={i} className="flex items-start">
                  <Text 
                    textSize="sm"
                    color="muted"
                    className="leading-relaxed"
                  >
                    {text}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
} 