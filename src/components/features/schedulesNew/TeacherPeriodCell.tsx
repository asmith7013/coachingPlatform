/**
 * @fileoverview DEPRECATED - TeacherPeriodCell component
 * 
 * This component is deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new ScheduleDisplayTestPage for schedule display
 * - Use the new useScheduleComposition and useScheduleUI hooks for schedule logic
 * - Follow the new schema-first architecture patterns
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

'use client';

import React from 'react';
import { useScheduleContext } from './context';
import type { Period, Event } from '@/lib/schema/zod-schema/schedules/schedule';
import { SessionPurposes } from '@/lib/schema/enum';
import { extractEventsForPeriod } from './utils/visit-data-utils';

interface TeacherPeriodCellProps {
  teacherId: string;
  period: number;
  schedule?: Period;
}

/**
 * @deprecated Use TeacherPeriodCell from @/components/features/schedulesUpdated/ instead.
 * This component will be removed in a future version.
 * Migration: Replace with equivalent component from schedulesUpdated feature.
 */
export function TeacherPeriodCell({ teacherId, period, schedule }: TeacherPeriodCellProps) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: TeacherPeriodCell from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  // ✅ Use context directly with UI state
  const { 
    uiState,
    selectTeacherPeriod,
    getVisitForTeacherPeriod,
    visits
  } = useScheduleContext();
  
  const { selectedTeacher, selectedPeriod } = uiState;

  // ✅ Ensure period is number
  const periodNum = typeof period === 'string' ? parseInt(period, 10) : period;
  const isSelected = selectedTeacher === teacherId && selectedPeriod === periodNum;
  const visit = getVisitForTeacherPeriod(teacherId, periodNum);
  
  // ✅ Simple helper: Check if period is fully scheduled
  const dropZoneFullyScheduled = visits.some(v => 
    v.events?.[0]?.staffIds?.[0] === teacherId && 
    // TODO: Extract period from visit when schema supports it
    false
  );

  // ✅ HELPER: Get event styling based on event type
  const getEventStyling = (eventType: string) => {
    switch (eventType) {
      case SessionPurposes.OBSERVATION:
      case 'observation':
        return {
          backgroundColor: '#3B82F6', // blue-500
          borderColor: '#1E40AF',     // blue-700
          textColor: 'white',
          label: 'Observation'
        };
      case SessionPurposes.DEBRIEF:
      case 'debrief':
        return {
          backgroundColor: '#8B5CF6', // purple-500
          borderColor: '#7C3AED',     // purple-600
          textColor: 'white',
          label: 'Debrief'
        };
      case SessionPurposes.CO_PLANNING:
      case 'co-planning':
        return {
          backgroundColor: '#8B5CF6', // purple-500
          borderColor: '#7C3AED',     // purple-600
          textColor: 'white',
          label: 'Co-Planning'
        };
      case SessionPurposes.PLC:
      case 'plc':
        return {
          backgroundColor: '#10B981', // green-500
          borderColor: '#059669',     // green-600
          textColor: 'white',
          label: 'PLC'
        };
      default:
        return {
          backgroundColor: '#3B82F6', // blue-500 (default)
          borderColor: '#1E40AF',     // blue-700
          textColor: 'white',
          label: 'Visit'
        };
    }
  };

  if (visit) {
    // ✅ FIX: Get the actual event for this teacher and period
    const eventsForPeriod = extractEventsForPeriod(visit, periodNum);
    const teacherEvent = eventsForPeriod.find((event : Event) => 
      event.staffIds?.includes(teacherId)
    );
    
    // Extract event type from the actual event data
    const eventType = teacherEvent?.eventType || teacherEvent?.eventType || visit.allowedPurpose || 'observation';
    const styling = getEventStyling(eventType);

    return (
      <div 
        className="h-16 flex flex-col items-center justify-center text-white rounded border"
        style={{
          backgroundColor: styling.backgroundColor,
          borderColor: styling.borderColor,
          color: styling.textColor
        }}
      >
        <span className="font-medium text-sm">{styling.label}</span>
        <span className="text-xs opacity-90">Scheduled</span>
      </div>
    );
  }

  if (schedule?.activityType === 'lunch') {
    const getLunchStyle = () => {
      if (isSelected) {
        return {
          backgroundColor: '#EC4899', // pink-500
          borderColor: '#BE185D',     // pink-700
          borderWidth: '3px',
          color: 'white'
        };
      }
      if (dropZoneFullyScheduled) {
        return {
          backgroundColor: '#FDF2F8', // pink-50
          borderColor: '#FCE7F3',     // pink-100
          color: '#F9A8D4'            // pink-300
        };
      }
      return {
        backgroundColor: '#FDF2F8',   // pink-50
        borderColor: '#FBCFE8',       // pink-200
        color: '#BE185D'              // pink-700
      };
    };

    return (
      <div 
        className="h-16 flex items-center justify-center rounded cursor-pointer transition-all border hover:opacity-80"
        style={getLunchStyle()}
        onClick={() => !dropZoneFullyScheduled && selectTeacherPeriod(teacherId, periodNum)}
      >
        <div className="text-center">
          <div className="font-medium text-sm">LUNCH</div>
          <div className="text-xs">
            {isSelected ? 'Selected' : dropZoneFullyScheduled ? 'Period full' : 'Click to select'}
          </div>
        </div>
      </div>
    );
  }

    if (schedule?.activityType === 'prep') {
    const getPrepStyle = () => {
      if (isSelected) {
        return {
          backgroundColor: '#6B7280', // gray-500
          borderColor: '#374151',     // gray-700
          borderWidth: '3px',
          color: 'white'
        };
      }
      if (dropZoneFullyScheduled) {
        return {
          backgroundColor: '#F9FAFB', // gray-50
          borderColor: '#F3F4F6',     // gray-100
          color: '#9CA3AF'            // gray-400
        };
      }
      return {
        backgroundColor: '#F3F4F6',   // gray-100
        borderColor: '#E5E7EB',       // gray-200
        color: '#374151'              // gray-700
      };
    };

    return (
      <div 
        className="h-16 flex flex-col items-center justify-center rounded cursor-pointer transition-all border hover:opacity-80"
        style={getPrepStyle()}
        onClick={() => !dropZoneFullyScheduled && selectTeacherPeriod(teacherId, periodNum)}
      >
        <span className="font-medium text-sm">PREP</span>
        <span className="text-xs">
          {isSelected ? 'Selected' : dropZoneFullyScheduled ? 'Period scheduled' : 'Available'}
        </span>
      </div>
    );
  }

  // ✅ Schema-first: Default case for regular class periods using Period.className
  const getBackgroundStyle = () => {
    if (isSelected) {
      return {
        backgroundColor: '#3B82F6', // blue-500
        borderColor: '#1D4ED8',     // blue-700
        borderWidth: '3px',
        color: 'white'
      };
    }
    if (dropZoneFullyScheduled) {
      return {
        backgroundColor: '#EBF8FF', // blue-50
        borderColor: '#DBEAFE',     // blue-100
        color: '#93C5FD'            // blue-300
      };
    }
    return {
      backgroundColor: '#EBF8FF',   // blue-50
      borderColor: '#BFDBFE',       // blue-200
      color: '#1D4ED8'              // blue-700
    };
  };

  return (
    <div 
      className="h-16 rounded cursor-pointer transition-all border hover:opacity-80"
      style={getBackgroundStyle()}
      onClick={() => !dropZoneFullyScheduled && selectTeacherPeriod(teacherId, periodNum)}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <span className="font-medium text-sm">
          {schedule?.className || 'Available'}
        </span>
        {schedule?.room && (
          <span className="text-xs opacity-75">
            Room {schedule.room}
          </span>
        )}
        <span className="text-xs">
          {isSelected ? 'Selected' : dropZoneFullyScheduled ? 'Period scheduled' : 'Click to select'}
        </span>
      </div>
    </div>
  );
} 