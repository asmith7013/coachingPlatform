import React from 'react';
import { Eye } from 'lucide-react';
import { useScheduleSelection, useDropZoneActions } from './context';
import { ScheduledVisit } from './types';

interface DropZoneCellProps {
  period: number | string;
}

export function DropZoneCell({ period }: DropZoneCellProps) {
  const { selectedTeacher, selectedPeriod } = useScheduleSelection();
  const {
    teacherSchedules,
    eventTypes,
    openDropdown,
    setOpenDropdown,
    getDropZoneItems,
    isHalfAvailable,
    handlePeriodPortionSelect,
    updateEventType,
    removeDropZoneItem
  } = useDropZoneActions();

  const isSelected = selectedTeacher && selectedPeriod === period;
  const dropZoneItems = getDropZoneItems(period);
  const firstHalfItem = dropZoneItems.find((item: ScheduledVisit) => item.portion === 'first_half' || item.portion === 'full_period');
  const secondHalfItem = dropZoneItems.find((item: ScheduledVisit) => item.portion === 'second_half' || item.portion === 'full_period');
  const fullPeriodItem = dropZoneItems.find((item: ScheduledVisit) => item.portion === 'full_period');

  // console.log('🎯 DropZoneCell render:', { 
  //   period, 
  //   selectedTeacher, 
  //   selectedPeriod, 
  //   isSelected,
  //   dropZoneItemsCount: dropZoneItems.length 
  // });

  // If there's a full period item, show it completely filled
  if (fullPeriodItem) {
    const dropdownId = `${period}-${fullPeriodItem.portion}`;
    return (
      <div className={`h-16 flex flex-col items-center justify-center text-white rounded border relative group
        ${fullPeriodItem.purpose === 'observation' ? 'bg-blue-500 border-blue-600' : 
          fullPeriodItem.purpose === 'debrief' || fullPeriodItem.purpose === 'co-planning' ? 'bg-purple-500 border-purple-600' :
          fullPeriodItem.purpose === 'professional-learning' ? 'bg-green-500 border-green-600' : 'bg-blue-500 border-blue-600'}`}>
        <button 
          className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          onClick={() => removeDropZoneItem(period, fullPeriodItem.portion)}
        >
          ×
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-lg">
            {React.createElement(eventTypes.find(et => et.value === fullPeriodItem.purpose)?.icon || Eye, { 
              className: "w-4 h-4" 
            })}
          </span>
          <span className="font-medium text-sm">{fullPeriodItem.teacherName}</span>
          <button 
            className="flex items-center space-x-1 hover:opacity-80 rounded px-1"
            onClick={() => setOpenDropdown(openDropdown === dropdownId ? null : dropdownId)}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        <span className="text-xs opacity-90">{eventTypes.find(et => et.value === fullPeriodItem.purpose)?.label || 'Observation'}</span>
        
        {/* Dropdown */}
        {openDropdown === dropdownId && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
            {eventTypes.map(eventType => (
              <button
                key={eventType.value}
                className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b flex items-center space-x-2"
                onClick={() => updateEventType(period, fullPeriodItem.portion, eventType.value)}
              >
                <span className="text-lg">
                  {React.createElement(eventType.icon, { className: "w-4 h-4" })}
                </span>
                <span>{eventType.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

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
                ${isHalfAvailable(period, 'first') ? '' : 'opacity-50 cursor-not-allowed'}`}
              style={{
                backgroundColor: isHalfAvailable(period, 'first') 
                  ? (selectedTeacher && teacherSchedules[selectedTeacher]?.[period]?.periodType === 'lunch' ? '#EC4899' :
                     selectedTeacher && teacherSchedules[selectedTeacher]?.[period]?.periodType === 'prep' ? '#6B7280' : '#3B82F6')
                  : '#9CA3AF'
              }}
              onClick={() => isHalfAvailable(period, 'first') && handlePeriodPortionSelect('first_half')}
            >
              {isHalfAvailable(period, 'first') ? 'First' : 'Taken'}
            </div>
            <div 
              className={`flex-1 flex items-center justify-center rounded text-white text-xs font-medium cursor-pointer transition-colors
                ${isHalfAvailable(period, 'second') ? '' : 'opacity-50 cursor-not-allowed'}`}
              style={{
                backgroundColor: isHalfAvailable(period, 'second') 
                  ? (selectedTeacher && teacherSchedules[selectedTeacher]?.[period]?.periodType === 'lunch' ? '#EC4899' :
                     selectedTeacher && teacherSchedules[selectedTeacher]?.[period]?.periodType === 'prep' ? '#6B7280' : '#3B82F6')
                  : '#9CA3AF'
              }}
              onClick={() => isHalfAvailable(period, 'second') && handlePeriodPortionSelect('second_half')}
            >
              {isHalfAvailable(period, 'second') ? 'Second' : 'Taken'}
            </div>
          </div>
          {/* Right side: Full Period taking full height */}
          <div 
            className={`flex-1 flex items-center justify-center rounded text-white text-xs font-medium cursor-pointer transition-colors
              ${dropZoneItems.length === 0 ? '' : 'opacity-50 cursor-not-allowed'}`}
            style={{
              backgroundColor: dropZoneItems.length === 0 
                ? (selectedTeacher && teacherSchedules[selectedTeacher]?.[period]?.periodType === 'lunch' ? '#EC4899' :
                   selectedTeacher && teacherSchedules[selectedTeacher]?.[period]?.periodType === 'prep' ? '#6B7280' : '#3B82F6')
                : '#9CA3AF'
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
                  onClick={() => removeDropZoneItem(period, firstHalfItem.portion)}
                >
                  ×
                </button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">
                    {React.createElement(eventTypes.find(et => et.value === firstHalfItem.purpose)?.icon || Eye, { 
                      className: "w-3 h-3" 
                    })}
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
                {openDropdown === `${period}-${firstHalfItem.portion}` && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
                    {eventTypes.map(eventType => (
                      <button
                        key={eventType.value}
                        className="w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b text-xs flex items-center space-x-1"
                        onClick={() => updateEventType(period, firstHalfItem.portion, eventType.value)}
                      >
                        <span className="text-sm">
                          {React.createElement(eventType.icon, { className: "w-3 h-3" })}
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
            {secondHalfItem ? (
              <div className={`text-white rounded-b w-full h-full flex items-center justify-center relative group
                ${secondHalfItem.purpose === 'observation' ? 'bg-blue-500' : 
                  secondHalfItem.purpose === 'debrief' || secondHalfItem.purpose === 'co-planning' ? 'bg-purple-500' :
                  secondHalfItem.purpose === 'professional-learning' ? 'bg-green-500' : 'bg-blue-500'}`}>
                <button 
                  className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  onClick={() => removeDropZoneItem(period, secondHalfItem.portion)}
                >
                  ×
                </button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">
                    {React.createElement(eventTypes.find(et => et.value === secondHalfItem.purpose)?.icon || Eye, { 
                      className: "w-3 h-3" 
                    })}
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
                {openDropdown === `${period}-${secondHalfItem.portion}` && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
                    {eventTypes.map(eventType => (
                      <button
                        key={eventType.value}
                        className="w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b text-xs flex items-center space-x-1"
                        onClick={() => updateEventType(period, secondHalfItem.portion, eventType.value)}
                      >
                        <span className="text-sm">
                          {React.createElement(eventType.icon, { className: "w-3 h-3" })}
                        </span>
                        <span>{eventType.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : dropZoneItems.length === 0 ? (
              <div className="text-gray-400 text-xs text-center">
                <div>Available</div>
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