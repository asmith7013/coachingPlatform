'use client';

import { useState, useMemo } from 'react';
import { RubricCard, type RubricIndicator, type PerformanceLevelKey } from './RubricCard';
// import { RubricFilterPanel } from './RubricFilterPanel';
import { FilterableGridView } from '@/components/domain/rubrics/FilterableGridView';
import implementationData from '@/lib/json/im-implementation.json';
import RubricDomainCards from './RubricDomainCards';


interface RubricItem {
  id: string;
  level: PerformanceLevelKey;
  text: string;
}

export function RubricViewer() {
  const [selectedDomain, setSelectedDomain] = useState('C1');
  const [selectedItems] = useState(new Set<string>()); // No checkbox filters for now

  const filteredDomains = useMemo(() => {
    return implementationData
      .filter((r) => r.title.startsWith(selectedDomain))
      .map((r, i) => ({
        ...r,
        id: `${selectedDomain}-${i}`,
      })) as RubricIndicator[];
  }, [selectedDomain]);

  const extractItems = (domain: RubricIndicator): RubricItem[] => {
    const levels: PerformanceLevelKey[] = ['advanced', 'proficient', 'developing', 'not_yet', 'not_observed'];
    return levels.flatMap((level) =>
      domain[level].map((text: string, i: number) => ({
        id: `${domain.id}-${level}-${i}`,
        level,
        text,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Add the RubricDomainCards component above the filter panel */}
      <RubricDomainCards selectedDomain={selectedDomain} onSelect={setSelectedDomain} />      
      <FilterableGridView
        groups={filteredDomains}
        selectedItems={selectedItems}
        extractItems={extractItems}
        renderItemGroup={(domain, selected) => (
          <RubricCard domain={domain} selectedIndicators={selected} />
        )}
        // sidebar={
          
        // }
      />
    </div>
  );
}