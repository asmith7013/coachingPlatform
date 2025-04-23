'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getUnitURL } from '@/lib/domain/imRoutine/get-unit-URL';

type Props = {
  routine: string;
  grade: string;
  unit: string;
  curriculum: 'ILC' | 'Kendall Hunt';
};

export function RoutineBadge({ routine, grade, unit, curriculum }: Props) {
  const isMLR = /^MLR\d+/.test(routine);
  const url = isMLR ? getUnitURL(grade, unit, curriculum) : null;

  const badge = (
    <span
      className={cn(
        'text-[10px] font-medium px-2 py-0.5 rounded inline-block',
        isMLR ? 'bg-primary text-white' : 'bg-secondary text-white'
      )}
    >
      {routine}
    </span>
  );

  return isMLR && url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      {badge}
    </a>
  ) : (
    badge
  );
} 