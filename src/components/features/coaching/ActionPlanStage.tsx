import React from 'react';
import { cn } from '@/lib/ui/utils/formatters';
import { ActionPlanStageProps } from '@domain-types/coaching-action-plan';

export const ActionPlanStage: React.FC<ActionPlanStageProps> = ({ 
  number, 
  title, 
  children, 
  className = "" 
}) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6", className)}>
      {/* Stage header - minimal, since navigation shows stage info */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Stage {number}: {title}
        </h2>
      </div>
      
      {/* Full width content area */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}; 