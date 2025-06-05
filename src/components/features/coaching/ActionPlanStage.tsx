import React from 'react';
import { cn } from '@/lib/ui/utils/formatters';
import { ActionPlanStageProps } from '@domain-types/coaching-action-plan';

export const ActionPlanStage: React.FC<ActionPlanStageProps> = ({ 
  number, 
  title, 
  children, 
  className = "" 
}) => {
  // Create different background colors based on stage number
  const getBgColor = () => {
    switch (number) {
      case 1:
        return 'bg-primary';
      case 2:
        return 'bg-primary-600';
      case 3:
        return 'bg-primary-700';
      case 4:
        return 'bg-primary-800';
      case 5:
        return 'bg-primary-900';
      default:
        return 'bg-primary-500';
    }
  };

  const bgColorClass = getBgColor();

  return (
    <div className={cn("bg-white rounded-lg shadow-md mb-8 overflow-hidden", className)}>
      {/* Left sidebar with stage number and title - mirrors PDF layout */}
      <div className="flex flex-col md:flex-row">
        <div className={cn(bgColorClass, "text-white p-4 md:w-1/5")}>
          <div className="font-bold">Stage {number}:</div>
          <div className="text-lg font-semibold">{title}</div>
        </div>
        
        {/* Main content area */}
        <div className="p-6 md:w-4/5">
          {children}
        </div>
      </div>
    </div>
  );
}; 