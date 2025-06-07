import React from 'react';
import { Check, Download } from 'lucide-react';
import { DropZoneCell } from './DropZoneCell';
import { TeacherPeriodCell } from './TeacherPeriodCell';
import { useScheduleStructure, useScheduleSaveStatus } from './context';

export function ScheduleGrid() {
  const { teachers, timeSlots, teacherSchedules } = useScheduleStructure();
  const { saveStatus } = useScheduleSaveStatus();

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

          {/* Time Slot Rows - Fixed Columns */}
          {timeSlots.map((slot, index) => (
            <div key={`fixed-${index}`} className="flex">
              {/* Time Column */}
              <div className="border-b border-gray-100 p-4 bg-gray-50 border-r h-20 flex flex-col justify-center w-24 flex-shrink-0">
                <div className="text-sm text-gray-500 whitespace-nowrap">{slot.startTime}</div>
                <div className="font-medium text-gray-900 whitespace-nowrap">Period {slot.periodNum || index + 1}</div>
                <div className="text-sm text-gray-500 whitespace-nowrap">{slot.endTime}</div>
              </div>

              {/* Drop Zone Column */}
              <div className="border-b border-gray-100 p-2 h-20 flex items-center w-48 flex-shrink-0">
                <div className="w-full">
                  <DropZoneCell period={slot.periodNum || index + 1} />
                </div>
              </div>
            </div>
          ))}
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
            {timeSlots.map((slot, slotIndex) => (
              <div key={`scrollable-${slotIndex}`} className="flex">
                {teachers.map(teacher => (
                  <div key={`${teacher._id}-${slotIndex}`} className="border-b border-gray-100 p-2 min-w-48 h-20 flex items-center border-r">
                    <div className="w-full">
                      <TeacherPeriodCell 
                        teacherId={teacher._id}
                        period={slot.periodNum || slotIndex + 1}
                        schedule={teacherSchedules[teacher._id]?.[slot.periodNum || slotIndex + 1]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="border-t border-gray-200 p-4 flex justify-end">
        <div className="flex items-center space-x-4">
          {/* Save Status */}
          <div className="flex items-center space-x-2">
            {saveStatus === 'saved' && (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Saved</span>
              </>
            )}
          </div>
          
          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
} 