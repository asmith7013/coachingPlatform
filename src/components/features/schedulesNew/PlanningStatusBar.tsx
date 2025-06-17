/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use components from @/components/features/schedulesUpdated/ instead
 * @deprecated
 */

import React from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { useScheduleContext } from './context';
import { SessionPurposes } from '@/lib/schema/enum';
import { extractEventsForTeacher } from './utils/visit-data-utils';

/**
 * @deprecated Use PlanningStatusBar from @/components/features/schedulesUpdated/ instead.
 * This component will be removed in a future version.
 * Migration: Replace with equivalent component from schedulesUpdated feature.
 */
export function PlanningStatusBar() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: PlanningStatusBar from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  // ✅ SIMPLIFIED: Use context directly with simple helper
  const { teachers, visits } = useScheduleContext();
  
  // ✅ FIXED: Extract teacher planning from actual visit events
  const getTeacherPlanning = (teacherId: string) => {
    // Get all events for this teacher across all visits
    const teacherEvents = visits.flatMap(visit => 
      extractEventsForTeacher(visit, teacherId)
    );

    // Debug logging to understand what we're working with
    console.log(`🎯 Teacher ${teacherId} events:`, {
      eventsCount: teacherEvents.length,
      eventTypes: teacherEvents.map(event => event.eventType),
      eventPurposes: teacherEvents.map(event => event.eventType),
      events: teacherEvents
    });

    return {
      observation: teacherEvents.some(event => 
        event.eventType === SessionPurposes.OBSERVATION ||
        event.eventType === 'observation'
      ),
      meeting: teacherEvents.some(event => 
        event.eventType === SessionPurposes.DEBRIEF ||
        event.eventType === SessionPurposes.CO_PLANNING ||
        event.eventType === SessionPurposes.PLC ||
        event.eventType === 'debrief' ||
        event.eventType === 'co-planning' ||
        event.eventType === 'plc'
      )
    };
  };

  // Debug logging for overall context
  console.log('🔍 PlanningStatusBar Debug:', {
    teachersCount: teachers.length,
    visitsCount: visits.length,
    teachers: teachers.map(t => ({ id: t._id, name: t.staffName })),
    visitsStructure: visits.map(v => ({
      id: v._id,
      eventsCount: v.sessionLinks?.length || 0,
      eventTypes: v.sessionLinks?.map(e => e.purpose) || [],
      teachers: v.sessionLinks?.map(e => e.staffIds?.[0]) || []
    }))
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Teacher Planning Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            {teachers.map(teacher => {
              const planning = getTeacherPlanning(teacher._id);
              
              // Individual teacher debug
              console.log(`📊 Teacher ${teacher.staffName} (${teacher._id}) planning:`, planning);
              
              return (
                <div key={teacher._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 border">
                  <span className="font-medium text-gray-900 truncate min-w-0 flex-1 mr-2">
                    {teacher.staffName.length > 20 ? `${teacher.staffName.slice(0, 20)}...` : teacher.staffName}
                  </span>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {/* Observation Icon */}
                    <div className={`w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center transition-colors
                      ${planning.observation ? 'bg-blue-500' : 'bg-white'}`}>
                      <Eye className={`w-4 h-4 ${planning.observation ? 'text-white' : 'text-blue-500'}`} />
                    </div>
                    
                    {/* Meeting Icon */}
                    <div className={`w-8 h-8 rounded-full border-2 border-purple-500 flex items-center justify-center transition-colors
                      ${planning.meeting ? 'bg-purple-500' : 'bg-white'}`}>
                      <MessageCircle className={`w-4 h-4 ${planning.meeting ? 'text-white' : 'text-purple-500'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 