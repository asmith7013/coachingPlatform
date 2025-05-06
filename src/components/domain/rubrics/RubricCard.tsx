'use client';

import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@ui/utils/formatters';;

export type PerformanceLevelKey = 'not_observed' | 'not_yet' | 'developing' | 'proficient' | 'advanced';

export const performanceLevels = [
  { key: 'not_observed' as const, label: 'Not Observed', colorClass: 'bg-secondary-200' },
  { key: 'not_yet' as const, label: 'Not Yet', colorClass: 'bg-orange-400' },
  { key: 'developing' as const, label: 'Developing', colorClass: 'bg-yellow-500' },
  { key: 'proficient' as const, label: 'Proficient', colorClass: 'bg-green-500' },
  { key: 'advanced' as const, label: 'Advanced', colorClass: 'bg-green-600' },
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
    <Card padding="lg" radius="xl" className="">
      <Heading 
        level="h4"
        color="default"
        className={cn("mb-4", "text-primary", "font-medium")}
      >
        {domain.title}
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-3">
        {performanceLevels.map(({ key, label, colorClass }) => (
          <div key={key} className="flex flex-col">
            <div className={cn(
              "p-3 rounded-lg mb-4",
              colorClass
            )}>
              <Text weight="medium" className="text-center" color="white">
                {label}
              </Text>
            </div>
            <ul className="space-y-3">
              {domain[key].map((text, i) => (
                <li key={i} className="flex items-start">
                  <Text 
                    textSize="sm"
                    color="default"
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