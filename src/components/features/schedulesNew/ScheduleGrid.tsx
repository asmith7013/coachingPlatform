import React from 'react';
import { Check, Download } from 'lucide-react';
import { DropZoneCell } from './DropZoneCell';
import { TeacherPeriodCell } from './TeacherPeriodCell';
import { useScheduleContext } from './context';
import { findPeriodForTeacher } from './utils/schedule-helpers';

export function ScheduleGrid() {
  // ✅ Use schema types directly
  const { teachers, timeSlots, teacherSchedules } = useScheduleContext();

  // ✅ CLEAN: Graying logic removed - all teacher cells now fully visible and interactive

  // ✅ ENHANCED: Validate schema data before rendering
  if (!teachers.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p>No teachers found for this school.</p>
          <p className="text-sm mt-2">Please check that teachers are assigned to this school.</p>
        </div>
      </div>
    );
  }

  if (!timeSlots.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p>No bell schedule found for this school.</p>
          <p className="text-sm mt-2">Please configure the bell schedule to see time periods.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible">
      <div className="flex overflow-visible">
        {/* Fixed Left Columns */}
        <div className="flex-shrink-0 border-r border-gray-200">
          {/* Header Row - Fixed Columns */}
          <div className="flex">
            <div className="bg-gray-50 border-b border-gray-200 p-4 font-semibold text-gray-900 border-r h-20 flex items-center w-24 flex-shrink-0">
              Period
            </div>
            <div className="bg-gray-50 border-b border-gray-200 p-4 text-center h-20 flex items-center justify-center w-48 flex-shrink-0">
              <div className="font-semibold text-gray-900">Planned Schedule</div>
            </div>
          </div>

          {/* Time Slot Rows - Use Schema Data Directly */}
          {timeSlots.map((slot, index) => {
            const periodNum = slot.periodNum || index + 1;
            return (
              <div key={`fixed-${periodNum}`} className="flex">
                {/* Time Column - Use ClassScheduleItem properties directly */}
                <div className="border-b border-gray-100 p-4 bg-gray-50 border-r h-20 flex flex-col justify-center w-24 flex-shrink-0">
                  <div className="text-sm text-gray-500 whitespace-nowrap">{slot.startTime}</div>
                  <div className="font-medium text-gray-900 whitespace-nowrap">Period {periodNum}</div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">{slot.endTime}</div>
                </div>

                {/* Drop Zone Column */}
                <div className="border-b border-gray-100 p-2 h-20 flex items-center w-48 flex-shrink-0">
                  <div className="w-full">
                    <DropZoneCell period={periodNum} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable Right Columns */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-max">
            {/* Header Row - Teacher Columns */}
            <div className="flex">
              {teachers.map(teacher => (
                <div key={teacher._id} className="bg-gray-50 border-b border-gray-200 p-4 text-center min-w-48 h-20 flex items-center justify-center border-r">
                  <div className="font-semibold text-gray-900">{teacher.staffName}</div>
                </div>
              ))}
            </div>

            {/* Time Slot Rows - Teacher Columns */}
            {timeSlots.map((slot, slotIndex) => {
              const periodNum = slot.periodNum || slotIndex + 1;
              
              return (
                <div key={`scrollable-${periodNum}`} className="flex">
                  {teachers.map(teacher => {
                    // ✅ SCHEMA-FIRST: Use helper function instead of transformation
                    const period = findPeriodForTeacher(teacherSchedules, teacher._id, periodNum);
                    
                    return (
                      <div 
                        key={`${teacher._id}-${periodNum}`} 
                        className="border-b border-gray-100 p-2 min-w-48 h-20 flex items-center border-r"
                      >
                        <div className="w-full">
                          <TeacherPeriodCell 
                            teacherId={teacher._id}
                            period={periodNum}
                            schedule={period} // Pass Period directly from schema
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="border-t border-gray-200 p-4 flex justify-end">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">Ready</span>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
} 