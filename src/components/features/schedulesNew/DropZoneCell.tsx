import React, { useState, useMemo } from 'react';
import { Eye, Calendar, Users, BookOpen } from 'lucide-react';
import { useScheduleContext } from './context';
import { extractPeriodFromVisit, extractTeacherIdFromVisit, extractEventsForPeriod } from './utils/visit-data-utils';
import { ScheduleAssignment, SessionPurposes } from '@enums';

interface DropZoneCellProps {
  period: number;
}

// Event types configuration for dropdown
const eventTypes = [
  { value: SessionPurposes.OBSERVATION, label: 'Observation', icon: Eye },
  { value: SessionPurposes.DEBRIEF, label: 'Debrief', icon: Calendar },
  { value: SessionPurposes.CO_PLANNING, label: 'Co-Planning', icon: Users },
  { value: SessionPurposes.PLC, label: 'PLC', icon: BookOpen }
];

export function DropZoneCell({ period }: DropZoneCellProps) {
  const {
    uiState,
    scheduleVisit,
    updateVisit,
    removeEventFromVisit,
    clearSelection, // ✅ ADD: Import clearSelection function
    teachers,
    visits,
    schoolId,
    date,
    mode,
    visitId
  } = useScheduleContext();

  // Local state for dropdown management
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getTeacherName = useMemo(() => (teacherId: string) => {
    return teachers.find(t => t._id === teacherId)?.staffName || 'Unknown'
  }, [teachers])
    
  // Extract context values that were referenced but not destructured
  const selectedTeacher = uiState.selectedTeacher;

  // ✅ ENHANCED: Extract ALL events for this period from ALL visits
  const periodEvents = useMemo(() => {
    const events: Array<{
      visitId: string;
      event: {
        staff?: string[];
        portion?: string;
        eventType?: string;
        periodNumber?: number;
      };
      eventIndex: number;
      teacherId: string;
      teacherName: string;
    }> = [];
    
    visits.forEach(visit => {
      const eventsForPeriod = extractEventsForPeriod(visit, period);
      eventsForPeriod.forEach((event, localIndex) => {
        // Find the actual index in the visit's events array
        const actualEventIndex = visit.events?.findIndex(e => e === event) ?? localIndex;
        const teacherId = event.staffIds?.[0] || 'unknown';
        
        events.push({
          visitId: visit._id,
          event,
          eventIndex: actualEventIndex,
          teacherId,
          teacherName: getTeacherName(teacherId)
        });
      });
    });
    
    // console.log(`📊 Period ${period} Enhanced Debug:`, {
    //   totalVisits: visits.length,
    //   eventsInPeriod: events.length,
    //   eventBreakdown: events.map(e => ({
    //     visitId: e.visitId,
    //     teacher: e.teacherName,
    //     portion: e.event.portion,
    //     purpose: e.event.eventType
    //   }))
    // });
    
    return events;
  }, [visits, period, getTeacherName]);
  
  // ✅ FIX: Only show selection UI when this specific teacher+period is selected
  const isThisPeriodSelected = selectedTeacher && uiState.selectedPeriod === period;

  // ✅ FIXED: Check if ANY event in visit is for this period (not just first event)
  const periodVisits = visits.filter(visit => 
    visit.events?.some(event => event.periodNumber === period)
  );
  
  // ✅ REMOVED: extractEventPurpose function (was only used by removed _renderVisit)

  // ✅ UPDATED: Create display items from individual events, not visits
  const dropZoneItems = periodEvents.map(({ visitId, event, eventIndex, teacherId, teacherName }) => ({
    id: `${visitId}-${eventIndex}`, // Unique ID per event
    visitId,
    eventIndex,
    teacherId,
    teacherName,
    portion: event.portion || ScheduleAssignment.FULL_PERIOD,
    purpose: event.eventType || SessionPurposes.OBSERVATION
  }));

  const firstHalfItem = dropZoneItems.find(item => item.portion === ScheduleAssignment.FIRST_HALF);
  const secondHalfItem = dropZoneItems.find(item => item.portion === ScheduleAssignment.SECOND_HALF);
  const fullPeriodItem = dropZoneItems.find(item => item.portion === ScheduleAssignment.FULL_PERIOD);

  // ✅ UPDATED: Remove events only, never delete entire visits
  const removeDropZoneItem = async (eventId: string) => {
    console.log('🗑️ === REMOVE EVENT DEBUG START ===');
    console.log('🗑️ Event ID:', eventId);
    console.log('🗑️ From period:', period);
    
    // Extract visitId and eventIndex from eventId (format: "visitId-eventIndex")
    const [visitId, eventIndexStr] = eventId.split('-');
    const eventIndex = parseInt(eventIndexStr, 10);
    
    console.log('🗑️ Removing event:', { visitId, eventIndex });
    
    try {
      // ✅ CORRECT: Remove only the specific event, keep the visit
      await removeEventFromVisit(visitId, eventIndex);
      console.log('🗑️ Event removed successfully');
    } catch (error) {
      console.error('🗑️ Failed to remove event:', error);
    }
    
    console.log('🗑️ === REMOVE EVENT DEBUG END ===');
  };

  const updateEventType = async (eventId: string, newPurpose: string) => {
    console.log('🔄 === UPDATE EVENT TYPE DEBUG START ===');
    console.log('🔄 Event ID:', eventId);
    console.log('🔄 New Purpose:', newPurpose);
    
    // ✅ CHECK: Is this an event ID or visit ID?
    const isEventId = eventId.includes('-');
    console.log('🔄 Is event ID?', isEventId);
    
    if (isEventId) {
      // ✅ EXTRACT: Get actual visit ID and event index
      const [actualVisitId, eventIndexStr] = eventId.split('-');
      const eventIndex = parseInt(eventIndexStr, 10);
      
      console.log('🔄 Extracted:', { actualVisitId, eventIndex });
      
      // ✅ FIND: Get the visit and update specific event
      const visit = visits.find(v => v._id === actualVisitId);
      if (!visit || !visit.events || visit.events.length <= eventIndex) {
        console.error('❌ Visit or event not found for update');
        return;
      }
      
      console.log('🔄 Found visit:', {
        id: visit._id,
        eventsCount: visit.events.length,
        targetEventIndex: eventIndex,
        currentEventType: visit.events[eventIndex]?.eventType
      });
      
      // ✅ UPDATE: Specific event in the events array
      const updatedEvents = visit.events.map((event, index) => 
        index === eventIndex 
          ? { 
              ...event, 
              eventType: newPurpose,
              purpose: newPurpose // Also update purpose for consistency
            }
          : event
      );
      
      console.log('🔄 Updated events:', {
        originalEventType: visit.events[eventIndex]?.eventType,
        newEventType: newPurpose,
        updatedEventAtIndex: updatedEvents[eventIndex]?.eventType
      });
      
      // ✅ CALL: updateVisit with visit ID and updated events array
      const result = await updateVisit(actualVisitId, { events: updatedEvents });
      console.log('🔄 Update result:', result);
      
      // ✅ CLOSE DROPDOWN: Auto-close after successful update
      if (result?.success !== false) {
        setOpenDropdown(null);
        // console.log('🔄 Dropdown closed after event type update');
      }
      
    } else {
      // ✅ LEGACY: Handle visit ID (single event per visit)
      console.log('🔄 Legacy mode: updating visit-level purpose');
      const result = await updateVisit(eventId, { purpose: newPurpose });
      
      // ✅ CLOSE DROPDOWN: Auto-close after successful legacy update
      if (result?.success !== false) {
        setOpenDropdown(null);
        console.log('🔄 Dropdown closed after legacy update');
      }
    }
    
    console.log('🔄 === UPDATE EVENT TYPE DEBUG END ===');
  };

  const getEventLabel = (purpose: string) => {
    return eventTypes.find(et => et.value === purpose)?.label || purpose;
  };

  const handlePeriodPortionSelect = async (portion: string) => {
    console.log('🔍 === VISIT CREATION DEBUG START ===');
    console.log('🎯 Click detected on portion:', portion);
    console.log('👤 Selected teacher:', selectedTeacher);
    console.log('⏰ Period number:', period);
    console.log('🏫 School ID from context:', schoolId);
    console.log('📅 Date from context:', date);
    console.log('⚙️ Mode from context:', mode);
    console.log('🆔 Visit ID from context:', visitId);
    console.log('📋 Current visits:', visits.map(v => ({ 
      id: v._id, 
      period: extractPeriodFromVisit(v),
      teacher: extractTeacherIdFromVisit(v) 
    })));
    
    if (!selectedTeacher) {
      console.warn('❌ No teacher selected for visit scheduling');
      return;
    }
    
    try {
      console.log('🚀 About to call scheduleVisit...');
      
      const _teacherName = teachers?.find(t => t._id === selectedTeacher)?.staffName || selectedTeacher;
      
      const visitData = {
        teacherId: selectedTeacher,
        periodNumber: period,
        portion: portion as ScheduleAssignment,
        purpose: SessionPurposes.OBSERVATION
      };
      
      console.log('📋 Visit data being sent:', visitData);
      
      const result = await scheduleVisit(visitData);
      
      console.log('📨 Raw result from scheduleVisit:', result);
      
      if (result === undefined) {
        console.error('❌ scheduleVisit returned undefined!');
        return;
      }
      
      if (result?.success) {
        console.log('✅ Visit scheduled successfully');
        console.log('📊 Post-creation visit count check:', {
          totalVisits: visits.length,
          periodVisits: periodVisits.length,
          message: 'Watch for visit count changes after React Query refetch'
        });
            // ✅ FIX: Clear selection after successful visit creation
        clearSelection();
        console.log('🧹 Selection cleared after successful visit creation');
        
        // ✅ DEBUG: Check if visit was actually added to local state
        setTimeout(() => {
          console.log('📊 Post-creation check (after 100ms):', {
            totalVisits: visits.length,
            periodVisits: visits.filter(v => extractPeriodFromVisit(v) === period).length,
            message: 'If count unchanged, cache invalidation may have failed'
          });
        }, 100);
      } else {
        console.error('❌ Visit scheduling failed:', result?.error);
      }
    } catch (error) {
      console.error('❌ Exception in handlePeriodPortionSelect:', error);
    } finally {
      console.log('🔍 === VISIT CREATION DEBUG END ===');
    }
  };

  // Safe helper to render icon component with proper typing
  const renderEventIcon = (purpose: string, className: string) => {
    const eventType = eventTypes?.find(et => et.value === purpose);
    const IconComponent = eventType?.icon || Eye;
    return <IconComponent className={className} />;
  };

  // Helper to check if half is available for selected teacher
  const isHalfAvailableForSelected = (period: number, half: 'first' | 'second') => {
    if (!selectedTeacher) return false;
    const _portion = half === 'first' ? ScheduleAssignment.FIRST_HALF : ScheduleAssignment.SECOND_HALF;
    // TODO: Implement proper availability checking
    return true; // For now, assume always available
  };

  // Show partial fills or selection options
  return (
    <div className="h-16 border border-gray-200 bg-gray-50 rounded transition-all">
      
      {isThisPeriodSelected ? (
        <div className="h-full flex gap-1 p-1">
          {/* Left side: First Half and Second Half stacked */}
          <div className="flex-1 flex flex-col gap-1">
            <div 
              className={`flex-1 flex items-center justify-center rounded text-white text-xs font-medium cursor-pointer transition-colors
                ${isHalfAvailableForSelected(period, 'first') ? '' : 'opacity-50 cursor-not-allowed'}`}
              style={{
                backgroundColor: isHalfAvailableForSelected(period, 'first') ? '#3B82F6' : '#9CA3AF'
              }}
              onClick={() => isHalfAvailableForSelected(period, 'first') && handlePeriodPortionSelect(ScheduleAssignment.FIRST_HALF)}
            >
              {isHalfAvailableForSelected(period, 'first') ? 'First' : 'Taken'}
            </div>
            <div 
              className={`flex-1 flex items-center justify-center rounded text-white text-xs font-medium cursor-pointer transition-colors
                ${isHalfAvailableForSelected(period, 'second') ? '' : 'opacity-50 cursor-not-allowed'}`}
              style={{
                backgroundColor: isHalfAvailableForSelected(period, 'second') ? '#3B82F6' : '#9CA3AF'
              }}
              onClick={() => isHalfAvailableForSelected(period, 'second') && handlePeriodPortionSelect(ScheduleAssignment.SECOND_HALF)}
            >
              {isHalfAvailableForSelected(period, 'second') ? 'Second' : 'Taken'}
            </div>
          </div>
          {/* Right side: Full Period taking full height */}
          <div 
            className={`flex-1 flex items-center justify-center rounded text-white text-xs font-medium cursor-pointer transition-colors
              ${dropZoneItems.length === 0 ? '' : 'opacity-50 cursor-not-allowed'}`}
            style={{
              backgroundColor: dropZoneItems.length === 0 ? '#3B82F6' : '#9CA3AF'
            }}
            onClick={() => dropZoneItems.length === 0 && handlePeriodPortionSelect(ScheduleAssignment.FULL_PERIOD)}
          >
            {dropZoneItems.length === 0 ? 'Full' : 'Taken'}
          </div>
        </div>
      ) : (
        // ✅ FIX: Handle full period visits properly
        <div className="h-full flex flex-col">
          {fullPeriodItem ? (
            // Show full period visit spanning both halves
            <div className={`w-full h-full flex items-center justify-center text-white rounded relative group
              ${fullPeriodItem.purpose === SessionPurposes.OBSERVATION ? 'bg-blue-500' : 
                fullPeriodItem.purpose === SessionPurposes.DEBRIEF || fullPeriodItem.purpose === SessionPurposes.CO_PLANNING ? 'bg-purple-500' :
                fullPeriodItem.purpose === SessionPurposes.PLC ? 'bg-green-500' : 'bg-blue-500'}`}>
              <button 
                className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                onClick={() => removeDropZoneItem(fullPeriodItem.id)}
              >
                ×
              </button>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                  <span>
                    {renderEventIcon(fullPeriodItem.purpose, "w-4 h-4")}
                  </span>
                  <span className="font-medium text-sm">{fullPeriodItem.teacherName}</span>
                  <button 
                    className="hover:opacity-80 rounded p-0.5"
                    onClick={() => {
                      const dropdownId = `${period}-full-period`;
                      setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
                    }}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
                <span className="text-xs opacity-90">{getEventLabel(fullPeriodItem.purpose)}</span>
              </div>
              
              {/* Dropdown for full period */}
              {openDropdown === `${period}-full-period` && eventTypes && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
                  {eventTypes.map(eventType => (
                    <button
                      key={eventType.value}
                      className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b flex items-center space-x-2"
                      onClick={() => updateEventType(fullPeriodItem.id, eventType.value)}
                    >
                      <span>
                        {renderEventIcon(eventType.value, "w-4 h-4")}
                      </span>
                      <span>{eventType.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Show half-period layout when no full period visit exists
            <>
              {/* First half */}
              <div className="flex-1 flex items-center justify-center">
                {firstHalfItem ? (
                  <div className={`text-white rounded-t w-full h-full flex items-center justify-center relative group
                    ${firstHalfItem.purpose === SessionPurposes.OBSERVATION ? 'bg-blue-500' : 
                      firstHalfItem.purpose === SessionPurposes.DEBRIEF || firstHalfItem.purpose === SessionPurposes.CO_PLANNING ? 'bg-purple-500' :
                      firstHalfItem.purpose === SessionPurposes.PLC ? 'bg-green-500' : 'bg-blue-500'}`}>
                    <button 
                      className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      onClick={() => removeDropZoneItem(firstHalfItem.id)}
                    >
                      ×
                    </button>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">
                        {renderEventIcon(firstHalfItem.purpose, "w-3 h-3")}
                      </span>
                      <span className="font-medium text-xs">{firstHalfItem.teacherName}</span>
                      <button 
                        className="hover:opacity-80 rounded p-0.5"
                        onClick={() => {
                          const dropdownId = `${period}-${firstHalfItem.portion}`;
                          setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
                        }}
                      >
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Dropdown for first half */}
                    {openDropdown === `${period}-${firstHalfItem.portion}` && eventTypes && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
                        {eventTypes.map(eventType => (
                          <button
                            key={eventType.value}
                            className="w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b text-xs flex items-center space-x-1"
                            onClick={() => updateEventType(firstHalfItem.id, eventType.value)}
                          >
                            <span className="text-sm">
                              {renderEventIcon(eventType.value, "w-3 h-3")}
                            </span>
                            <span>{eventType.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">Available</span>
                )}
              </div>
              {/* Second half */}
              <div className="flex-1 flex items-center justify-center">
                {secondHalfItem && secondHalfItem.portion !== ScheduleAssignment.FULL_PERIOD ? (
                  <div className={`text-white rounded-b w-full h-full flex items-center justify-center relative group
                    ${secondHalfItem.purpose === SessionPurposes.OBSERVATION ? 'bg-blue-500' : 
                      secondHalfItem.purpose === SessionPurposes.DEBRIEF || secondHalfItem.purpose === SessionPurposes.CO_PLANNING ? 'bg-purple-500' :
                      secondHalfItem.purpose === SessionPurposes.PLC ? 'bg-green-500' : 'bg-blue-500'}`}>
                    <button 
                      className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      onClick={() => removeDropZoneItem(secondHalfItem.id)}
                    >
                      ×
                    </button>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">
                        {renderEventIcon(secondHalfItem.purpose, "w-3 h-3")}
                      </span>
                      <span className="font-medium text-xs">{secondHalfItem.teacherName}</span>
                      <button 
                        className="hover:opacity-80 rounded p-0.5"
                        onClick={() => {
                          const dropdownId = `${period}-${secondHalfItem.portion}`;
                          setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
                        }}
                      >
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Dropdown for second half */}
                    {openDropdown === `${period}-${secondHalfItem.portion}` && eventTypes && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
                        {eventTypes.map(eventType => (
                          <button
                            key={eventType.value}
                            className="w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b text-xs flex items-center space-x-1"
                            onClick={() => updateEventType(secondHalfItem.id, eventType.value)}
                          >
                            <span className="text-sm">
                              {renderEventIcon(eventType.value, "w-3 h-3")}
                            </span>
                            <span>{eventType.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">Available</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
