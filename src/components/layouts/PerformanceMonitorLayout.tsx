"use client";

import React from 'react';

/**
 * Layout component that previously added performance monitoring
 * Now it just passes children through since monitoring is disabled
 */
export function PerformanceMonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Performance monitoring has been disabled
  return <>{children}</>;
} 