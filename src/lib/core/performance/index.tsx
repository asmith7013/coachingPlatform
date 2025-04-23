import React from 'react';

// Temporary simplified performance monitor provider
export const PerformanceMonitorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
}; 