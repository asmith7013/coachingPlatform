"use client";

import { useState } from "react";
import { AccordionItem } from "../AccordionItem";

interface StandardsSectionProps {
  standards: string;
}

export function StandardsSection({ standards }: StandardsSectionProps) {
  const [expandedStandards, setExpandedStandards] = useState<Set<number>>(new Set());

  const toggleStandard = (index: number) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStandards(newExpanded);
  };

  if (!standards) return null;

  // Parse standards HTML to extract standard codes and descriptions
  const parser = new DOMParser();
  const doc = parser.parseFromString(standards, 'text/html');
  const text = doc.body.textContent || '';

  // Split by "NY." to find standard boundaries
  const segments = text.split(/\b(NY\.[A-Z0-9.a-z]+)/g).filter(s => s.trim());

  const parsed: Array<{ type: 'code' | 'text', content: string }> = [];

  segments.forEach((segment) => {
    if (segment.match(/^NY\.[A-Z0-9.a-z]+/)) {
      const match = segment.match(/^(NY\.[A-Z0-9.a-z]+):?/);
      if (match) {
        const code = match[1];
        parsed.push({ type: 'code', content: code });

        const remaining = segment.substring(match[0].length).trim();
        if (remaining) {
          parsed.push({ type: 'text', content: remaining });
        }
      }
    } else {
      const trimmed = segment.trim().replace(/^:\s*/, '');
      if (trimmed) {
        parsed.push({ type: 'text', content: trimmed });
      }
    }
  });

  // If no standards found, fall back to original HTML rendering
  if (parsed.filter(p => p.type === 'code').length === 0) {
    return (
      <div className="border-b border-gray-200 pb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Standards</h4>
        <div
          className="text-sm text-gray-600 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: standards }}
        />
      </div>
    );
  }

  // Group by standard code
  const groups: Array<Array<{ type: 'code' | 'text', content: string }>> = [];
  let currentGroup: Array<{ type: 'code' | 'text', content: string }> = [];

  parsed.forEach((item) => {
    if (item.type === 'code') {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [item];
    } else {
      currentGroup.push(item);
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return (
    <div className="border-b border-gray-200 py-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Standards</h4>
      <div className="grid grid-cols-2 gap-2">
        {groups.map((group, groupIndex) => {
          const code = group.find(p => p.type === 'code')?.content || '';
          const description = group.filter(p => p.type === 'text').map(p => p.content).join(' ');

          return (
            <AccordionItem
              key={groupIndex}
              title={code}
              content={description}
              isExpanded={expandedStandards.has(groupIndex)}
              onToggle={() => toggleStandard(groupIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}
