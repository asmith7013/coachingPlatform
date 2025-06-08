import React, { useState } from 'react';
import { Eye, Calendar, Users, BookOpen } from 'lucide-react';
import { useScheduleContext } from './context';
import type { Visit } from '@zod-schema/visits/visit';
import { extractPeriodFromVisit, extractTeacherIdFromVisit, extractPortionFromVisit } from './utils/visit-data-utils';
import { ScheduleAssignmentType } from '@domain-types/schedule';

interface DropZoneCellProps {
  period: number;
}

// Event types configuration for dropdown
const eventTypes = [
  { value: 'observation', label: 'Observation', icon: Eye },
  { value: 'debrief', label: 'Debrief', icon: Calendar },
  { value: 'co-planning', label: 'Co-Planning', icon: Users },
  { value: 'professional-learning', label: 'Professional Learning', icon: BookOpen }
];

export function DropZoneCell({ period }: DropZoneCellProps) {
  const {
    uiState,
    scheduleVisit,
    updateVisit,
    deleteVisit,
    teachers,
    visits,
    schoolId,
    date,
    mode,
    visitId
  } = useScheduleContext();

  // Local state for dropdown management
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Extract context values that were referenced but not destructured
  const selectedTeacher = uiState.selectedTeacher;
  const _teacherSchedules = {}; // TODO: Get from context when available
  const _coachId = 'current-coach-id'; // TODO: Get from auth context

  // Filter visits for this period
  const periodVisits = visits.filter(visit => extractPeriodFromVisit(visit) === period);
  const isSelected = selectedTeacher && uiState.selectedPeriod === period;

  // Create visit items for display logic
  const dropZoneItems = periodVisits.map(visit => ({
    id: visit._id,
    teacherId: extractTeacherIdFromVisit(visit),
    teacherName: getTeacherName(extractTeacherIdFromVisit(visit)),
    portion: extractPortionFromVisit(visit),
    purpose: visit.allowedPurpose || 'observation'
  }));

  const firstHalfItem = dropZoneItems.find(item => item.portion === 'first_half');
  const secondHalfItem = dropZoneItems.find(item => item.portion === 'second_half');
  const fullPeriodItem = dropZoneItems.find(item => item.portion === 'full_period');

  // Helper functions
  const removeDropZoneItem = async (visitId: string) => {
    await deleteVisit(visitId);
  };

  const updateEventType = async (visitId: string, newPurpose: string) => {
    await updateVisit(visitId, { purpose: newPurpose });
  };

  const getEventLabel = (purpose: string) => {
    return eventTypes.find(et => et.value === purpose)?.label || purpose;
  };

  const handlePeriodPortionSelect = async (portion: string) => {
    console.log('🔍 === CLICK DEBUG START ===');
    console.log('🎯 Click detected on portion:', portion);
    console.log('👤 Selected teacher:', selectedTeacher);
    console.log('⏰ Period number:', period);
    console.log('🏫 School ID from context:', schoolId);
    console.log('📅 Date from context:', date);
    console.log('⚙️ Mode from context:', mode);
    console.log('🆔 Visit ID from context:', visitId);
    
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
        portion: portion as ScheduleAssignmentType,
        purpose: 'observation'
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
      } else {
        console.error('❌ Visit scheduling failed:', result?.error);
      }
    } catch (error) {
      console.error('❌ Exception in handlePeriodPortionSelect:', error);
    } finally {
      console.log('🔍 === CLICK DEBUG END ===');
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
    const _portion = half === 'first' ? 'first_half' : 'second_half';
    // TODO: Implement proper availability checking
    return true; // For now, assume always available
  };

  // Helper to get teacher name
  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t._id === teacherId)?.staffName || 'Unknown';
  };

  const _renderVisit = (visit: Visit) => {
    const teacherId = extractTeacherIdFromVisit(visit);
    const teacherName = getTeacherName(teacherId);
    
    return (
      <div className={`h-16 flex flex-col items-center justify-center text-white rounded border relative group
        ${fullPeriodItem?.purpose === 'observation' ? 'bg-blue-500 border-blue-600' : 
          fullPeriodItem?.purpose === 'debrief' || fullPeriodItem?.purpose === 'co-planning' ? 'bg-purple-500 border-purple-600' :
          fullPeriodItem?.purpose === 'professional-learning' ? 'bg-green-500 border-green-600' : 'bg-blue-500 border-blue-600'}`}>
        <button 
          className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          onClick={() => removeDropZoneItem(visit._id)}
        >
          ×
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-lg">
            {renderEventIcon(visit.allowedPurpose || 'observation', "w-4 h-4")}
          </span>
          <span className="font-medium text-sm">{teacherName}</span>
          <button 
            className="flex items-center space-x-1 hover:opacity-80 rounded px-1"
            onClick={() => {
              const dropdownId = `${period}-full`;
              setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        <span className="text-xs opacity-90">{getEventLabel(visit.allowedPurpose || 'observation')}</span>
        
        {/* Dropdown */}
        {openDropdown === `${period}-full` && eventTypes && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
            {eventTypes.map(eventType => (
              <button
                key={eventType.value}
                className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b flex items-center space-x-2"
                onClick={() => updateEventType(visit._id, eventType.value)}
              >
                <span className="text-lg">
                  {renderEventIcon(eventType.value, "w-4 h-4")}
                </span>
                <span>{eventType.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Show partial fills or selection options
  return (
    <div className={`h-16 border rounded transition-all
      ${isSelected ? 'border-gray-300 bg-gray-100' : 'border-gray-200 bg-gray-50'}`}>
      
      {isSelected ? (
        <div className="h-full flex gap-1 p-1">
          {/* Left side: First Half and Second Half stacked */}
          <div className="flex-1 flex flex-col gap-1">
            <div 
              className={`flex-1 flex items-center justify-center rounded text-white text-xs font-medium cursor-pointer transition-colors
                ${isHalfAvailableForSelected(period, 'first') ? '' : 'opacity-50 cursor-not-allowed'}`}
              style={{
                backgroundColor: isHalfAvailableForSelected(period, 'first') ? '#3B82F6' : '#9CA3AF'
              }}
              onClick={() => isHalfAvailableForSelected(period, 'first') && handlePeriodPortionSelect('first_half')}
            >
              {isHalfAvailableForSelected(period, 'first') ? 'First' : 'Taken'}
            </div>
            <div 
              className={`flex-1 flex items-center justify-center rounded text-white text-xs font-medium cursor-pointer transition-colors
                ${isHalfAvailableForSelected(period, 'second') ? '' : 'opacity-50 cursor-not-allowed'}`}
              style={{
                backgroundColor: isHalfAvailableForSelected(period, 'second') ? '#3B82F6' : '#9CA3AF'
              }}
              onClick={() => isHalfAvailableForSelected(period, 'second') && handlePeriodPortionSelect('second_half')}
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
            onClick={() => dropZoneItems.length === 0 && handlePeriodPortionSelect('full_period')}
          >
            {dropZoneItems.length === 0 ? 'Full' : 'Taken'}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* First half */}
          <div className="flex-1 flex items-center justify-center">
            {firstHalfItem ? (
              <div className={`text-white rounded-t w-full h-full flex items-center justify-center relative group
                ${firstHalfItem.purpose === 'observation' ? 'bg-blue-500' : 
                  firstHalfItem.purpose === 'debrief' || firstHalfItem.purpose === 'co-planning' ? 'bg-purple-500' :
                  firstHalfItem.purpose === 'professional-learning' ? 'bg-green-500' : 'bg-blue-500'}`}>
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
            {secondHalfItem && secondHalfItem.portion !== 'full_period' ? (
              <div className={`text-white rounded-b w-full h-full flex items-center justify-center relative group
                ${secondHalfItem.purpose === 'observation' ? 'bg-blue-500' : 
                  secondHalfItem.purpose === 'debrief' || secondHalfItem.purpose === 'co-planning' ? 'bg-purple-500' :
                  secondHalfItem.purpose === 'professional-learning' ? 'bg-green-500' : 'bg-blue-500'}`}>
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
        </div>
      )}
    </div>
  );
}