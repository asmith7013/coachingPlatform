'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useTodaysVisit } from '@/hooks/domain/useTodaysVisit';
import { TodaysVisitDashboardContextType, TodaysVisitData } from '../types';

const TodaysVisitContext = createContext<TodaysVisitDashboardContextType | null>(null);

interface TodaysVisitProviderProps {
  children: React.ReactNode;
  coachId?: string;
  schoolId?: string;
}

export function TodaysVisitProvider({ 
  children, 
  coachId, 
  schoolId 
}: TodaysVisitProviderProps) {
  const {
    todaysVisit: baseTodaysVisit,
    isLoading: visitLoading,
    error: visitError,
    hasVisitToday,
    isVisitInPast,
    isVisitInFuture
  } = useTodaysVisit({ coachId, schoolId });

  // TODO: Enhanced data fetching for schedule details
  // const {
  //   schedule,
  //   isLoading: scheduleLoading
  // } = useVisitSchedule(baseTodaysVisit?.visit?.visitScheduleId);

  // Combine all data into final format
  const todaysVisit = useMemo((): TodaysVisitData | null => {
    if (!baseTodaysVisit) return null;

    // Enhanced with schedule data if available
    // For now, use basic schedule data until visit schedule hook is implemented
    const enhancedSchedule = {
      date: baseTodaysVisit.visit.date!,
      teachers: [], // Will be populated when visit schedule hook is available
    };

    return {
      ...baseTodaysVisit,
      schedule: enhancedSchedule,
    };
  }, [baseTodaysVisit]);

  const isLoading = visitLoading; // || scheduleLoading when implemented

  const refreshData = async () => {
    // Implementation for manual refresh if needed
    // Usually handled automatically by React Query
  };

  const contextValue: TodaysVisitDashboardContextType = {
    todaysVisit,
    isLoading,
    error: visitError,
    hasVisitToday,
    isVisitInPast,
    isVisitInFuture,
    refreshData,
  };

  return (
    <TodaysVisitContext.Provider value={contextValue}>
      {children}
    </TodaysVisitContext.Provider>
  );
}

// Selective context hooks for performance
export function useTodaysVisitData() {
  const context = useContext(TodaysVisitContext);
  if (!context) {
    throw new Error('Today\'s visit hooks must be used within TodaysVisitProvider');
  }
  return {
    todaysVisit: context.todaysVisit,
    isLoading: context.isLoading,
    error: context.error,
  };
}

export function useTodaysVisitStatus() {
  const context = useContext(TodaysVisitContext);
  if (!context) {
    throw new Error('Today\'s visit hooks must be used within TodaysVisitProvider');
  }
  return {
    hasVisitToday: context.hasVisitToday,
    isVisitInPast: context.isVisitInPast,
    isVisitInFuture: context.isVisitInFuture,
  };
}

export function useTodaysVisitActions() {
  const context = useContext(TodaysVisitContext);
  if (!context) {
    throw new Error('Today\'s visit hooks must be used within TodaysVisitProvider');
  }
  return {
    refreshData: context.refreshData,
  };
} 