import React from 'react';
import { cn } from '@ui/utils/formatters';;
import { radii } from '@/lib/tokens';
import { TimeCell } from './TimeCell';
import { ActivitySelector } from './ActivitySelector';
import { StaffSelector } from './StaffSelector';
import { TeacherActivityColumns } from './TeacherActivityColumns';
import { ScheduleRowProps } from '../data/scheduleTypes';

/**
 * Component for schedule table rows
 */
export const ScheduleRow: React.FC<ScheduleRowProps> = ({
  period,
  isEditMode,
  isWashingtonHighSchool,
  staffOptions,
  activityOptions,
  washingtonTeachers,
  onStartTimeChange,
  onEndTimeChange,
  onWhatChange,
  onWhoChange,
  onClassInfoChange,
  onRoomInfoChange,
  validateTime
}) => {
  // Log for debugging
  React.useEffect(() => {
    if (isWashingtonHighSchool && washingtonTeachers) {
      console.log(`ScheduleRow period ${period.id} - washingtonTeachers available:`, 
        washingtonTeachers.length, 
        washingtonTeachers.map(t => t.name)
      );
    }
  }, [isWashingtonHighSchool, washingtonTeachers, period.id]);

  return (
    <tr className="border-b">
      <td className="py-2 px-4 border font-medium">
        {period.name}
      </td>
      
      <TimeCell 
        startTime={period.startTime}
        endTime={period.endTime}
        timeSlot={period.timeSlot}
        isEditMode={isEditMode}
        onStartTimeChange={(value) => onStartTimeChange(period.id, value)}
        onEndTimeChange={(value) => onEndTimeChange(period.id, value)}
        validateTime={validateTime}
      />
      
      <td className="py-2 px-4 border">
        <ActivitySelector 
          value={period.what}
          onChange={(value) => onWhatChange(period.id, value)}
          options={activityOptions}
        />
      </td>
      
      <td className="py-2 px-4 border">
        <StaffSelector 
          options={staffOptions}
          value={period.who}
          onChange={(selectedStaff) => onWhoChange(period.id, selectedStaff)}
          placeholder="Select staff"
        />
      </td>
      
      {isWashingtonHighSchool ? (
        <TeacherActivityColumns
          periodId={period.id}
          teachers={washingtonTeachers || []}
        />
      ) : (
        <td className="py-2 px-4 border">
          {isEditMode ? (
            <div className="space-y-2">
              <input
                type="text"
                value={period.classInfo}
                onChange={(e) => onClassInfoChange(period.id, e.target.value)}
                placeholder="Class"
                className={cn("w-full p-1 border", radii.md)}
              />
              <input
                type="text"
                value={period.roomInfo}
                onChange={(e) => onRoomInfoChange(period.id, e.target.value)}
                placeholder="Room"
                className={cn("w-full p-1 border", radii.md)}
              />
            </div>
          ) : (
            <div>
              {period.classInfo && <div><strong>Class:</strong> {period.classInfo}</div>}
              {period.roomInfo && <div><strong>Room:</strong> {period.roomInfo}</div>}
            </div>
          )}
        </td>
      )}
    </tr>
  );
}; 