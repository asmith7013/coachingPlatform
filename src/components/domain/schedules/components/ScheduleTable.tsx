import React from 'react';
import { ScheduleRow } from './ScheduleRow';
import { ScheduleTableProps } from '../data/scheduleTypes';

/**
 * Component for displaying the schedule table
 */
export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  periods,
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
  // Log washingtonTeachers for debugging
  React.useEffect(() => {
    if (isWashingtonHighSchool && washingtonTeachers) {
      console.log("ScheduleTable - washingtonTeachers:", washingtonTeachers);
    }
  }, [isWashingtonHighSchool, washingtonTeachers]);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="py-2 px-4 border">Period</th>
            {isEditMode ? (
              <>
                <th className="py-2 px-4 border">Start Time</th>
                <th className="py-2 px-4 border">End Time</th>
              </>
            ) : (
              <th className="py-2 px-4 border">Time</th>
            )}
            <th className="py-2 px-4 border">What</th>
            <th className="py-2 px-4 border">Who</th>
            {isWashingtonHighSchool ? (
              <>
                <th className="py-2 px-4 border bg-green-700">Teaching</th>
                <th className="py-2 px-4 border bg-purple-700">Prep</th>
                <th className="py-2 px-4 border bg-orange-700">Lunch</th>
              </>
            ) : (
              <th className="py-2 px-4 border">Class/Room Info</th>
            )}
          </tr>
        </thead>
        <tbody>
          {periods.map(period => (
            <ScheduleRow
              key={period.id}
              period={period}
              isEditMode={isEditMode}
              isWashingtonHighSchool={isWashingtonHighSchool}
              staffOptions={staffOptions}
              activityOptions={activityOptions}
              washingtonTeachers={washingtonTeachers}
              onStartTimeChange={onStartTimeChange}
              onEndTimeChange={onEndTimeChange}
              onWhatChange={onWhatChange}
              onWhoChange={onWhoChange}
              onClassInfoChange={onClassInfoChange}
              onRoomInfoChange={onRoomInfoChange}
              validateTime={validateTime}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}; 