'use client';

import React from 'react';
import { typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

type CurriculumVersionModalProps = {
  onSelectVersion: (version: 'KH' | 'ILC') => void;
};

export function CurriculumVersionModal({ onSelectVersion }: CurriculumVersionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-10 max-w-xl w-full shadow-xl text-center space-y-6">
        <h2 className={cn(typography.text.xl, typography.weight.bold)}>
          Select Your Curriculum Version
        </h2>
        <p className={cn(typography.text.base, 'text-muted')}>
          While both use Illustrative Mathematics content, <strong>Kendall Hunt</strong> and <strong>ILC</strong> have different routines embedded in their lessons.  
          Please choose the version your school uses so this tool can reflect the correct routines.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onSelectVersion('KH')}
            className="text-white text-lg font-bold bg-secondary px-6 py-3 rounded-xl hover:scale-105 transition cursor-pointer"
          >
            Kendall Hunt
          </button>
          <button
            onClick={() => onSelectVersion('ILC')}
            className="text-white text-lg font-bold bg-primary px-6 py-3 rounded-xl hover:scale-105 transition cursor-pointer"
          >
            ILC
          </button>
        </div>
      </div>
    </div>
  );
} 