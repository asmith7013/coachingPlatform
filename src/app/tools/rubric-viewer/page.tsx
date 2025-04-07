'use client';

import React, { useState, useMemo } from 'react';
import { DashboardPage } from '@/components/layouts/DashboardPage';
import { Select } from '@/components/ui/fields/Select';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { spacing, typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';
import implementationData from '@/lib/json/IMplementation.json';

type PerformanceLevelKey = 'not_observed' | 'not_yet' | 'developing' | 'proficient' | 'advanced';

interface PerformanceLevel {
  key: PerformanceLevelKey;
  label: string;
  colorClass: string;
}

interface RubricIndicator {
  title: string;
  advanced: string[];
  proficient: string[];
  developing: string[];
  not_yet: string[];
  not_observed: string[];
}

const domains = [
  { value: 'C1', label: 'C1: Creating a Culture of Learning' },
  { value: 'C2', label: 'C2: Facilitating Instruction' },
  { value: 'C3', label: 'C3: Student Engagement' },
];

const performanceLevels: PerformanceLevel[] = [
  { key: 'not_observed', label: 'Not Observed', colorClass: 'text-text-muted' },
  { key: 'not_yet', label: 'Not Yet', colorClass: 'text-danger' },
  { key: 'developing', label: 'Developing', colorClass: 'text-text' },
  { key: 'proficient', label: 'Proficient', colorClass: 'text-success' },
  { key: 'advanced', label: 'Advanced', colorClass: 'text-primary' },
];

export default function RubricViewerPage() {
  const [selectedDomain, setSelectedDomain] = useState('C1');
  const [isLoading, setIsLoading] = useState(false);

  const filteredRubrics = useMemo(() => {
    setIsLoading(true);
    const rubrics = implementationData.filter(rubric => 
      rubric.title.startsWith(selectedDomain)
    );
    setIsLoading(false);
    return rubrics;
  }, [selectedDomain]);

  return (
    <DashboardPage
      title="IM Rubric Viewer"
      description="Explore rubric indicators aligned to IM implementation guidance."
    >
      <div className={cn(spacing.md, "mb-8")}>
        <Select
          label="Select Domain"
          value={selectedDomain}
          onChange={setSelectedDomain}
          options={domains}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Text variant="text" className="text-text-muted">Loading rubrics...</Text>
        </div>
      ) : filteredRubrics.length === 0 ? (
        <Card padding="lg" radius="xl">
          <div className="text-center">
            <Text variant="text" size="lg" className="text-text-muted">
              No rubrics found for the selected domain.
            </Text>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredRubrics.map((rubric: RubricIndicator, index: number) => (
            <Card key={index} padding="lg" radius="xl">
              <Heading level="h4" className={cn(typography.weight.medium, 'text-primary', "mb-6")}>
                {rubric.title}
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {performanceLevels.map((level: PerformanceLevel) => (
                  <div key={level.key} className="flex flex-col">
                    <div className={cn(
                      "p-3 rounded-lg mb-4",
                      'bg-surface',
                      level.colorClass
                    )}>
                      <Text className={cn(typography.weight.medium, "text-center")}>
                        {level.label}
                      </Text>
                    </div>
                    <ul className="space-y-3">
                      {rubric[level.key].map((item: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <Text 
                            variant="text" 
                            size="sm" 
                            className="leading-relaxed text-text-muted"
                          >
                            {item}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardPage>
  );
} 