import React from 'react';

interface ActionPlanStageProps {
  number: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ActionPlanStage: React.FC<ActionPlanStageProps> = ({ 
  number, 
  title, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md mb-8 overflow-hidden ${className}`}>
      {/* Left sidebar with stage number and title - mirrors PDF layout */}
      <div className="flex flex-col md:flex-row">
        <div className="bg-blue-600 text-white p-4 md:w-1/5">
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