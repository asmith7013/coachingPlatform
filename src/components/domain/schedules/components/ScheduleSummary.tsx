import React from 'react';
// import { cn } from '@/lib/utils';
import { ScheduleSummaryProps } from '../data/scheduleTypes';
import { getTeachersByPeriodAndActivity } from '../utils/scheduleHelpers';

/**
 * Component that displays a summary of the schedule
 */
export const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({
  periods,
  activityOptions,
  getStaffNamesFromIds,
  isWashingtonHighSchool,
  washingtonTeachers
}) => {
  const activePeriods = periods.filter(p => p.what || p.who.length > 0 || p.classInfo || p.roomInfo);
  
  // Log data for debugging
  React.useEffect(() => {
    if (isWashingtonHighSchool && washingtonTeachers) {
      console.log("ScheduleSummary - Using washingtonTeachers:", washingtonTeachers.length);
    }
  }, [isWashingtonHighSchool, washingtonTeachers]);
  
  if (activePeriods.length === 0) {
    return (
      <div className="text-gray-500">
        No schedule items configured yet. Use the form above to create a schedule.
      </div>
    );
  }
  
  if (isWashingtonHighSchool && washingtonTeachers && washingtonTeachers.length > 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Teacher Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periods.map((period) => {
            // Get teachers for each activity type
            const teachingTeachers = getTeachersByPeriodAndActivity(period.id, 'teaching', washingtonTeachers);
            const prepTeachers = getTeachersByPeriodAndActivity(period.id, 'prep', washingtonTeachers);
            const lunchTeachers = getTeachersByPeriodAndActivity(period.id, 'lunch', washingtonTeachers);
            
            // Calculate total teachers with an activity in this period
            const totalTeachers = teachingTeachers.length + prepTeachers.length + lunchTeachers.length;
            
            return (
              <div key={period.id} className="p-3 border rounded-md shadow-sm bg-white">
                <h4 className="font-medium mb-2">{period.name} <span className="text-sm text-gray-500">({period.timeSlot})</span></h4>
                {totalTeachers > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                        Teaching: {teachingTeachers.length}
                      </span>
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                        Prep: {prepTeachers.length}
                      </span>
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-sm">
                        Lunch: {lunchTeachers.length}
                      </span>
                    </div>
                    
                    {teachingTeachers.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-green-800">Teaching:</span> {teachingTeachers.map(t => t.name).join(', ')}
                      </div>
                    )}
                    
                    {prepTeachers.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-purple-800">Prep:</span> {prepTeachers.map(t => t.name).join(', ')}
                      </div>
                    )}
                    
                    {lunchTeachers.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-orange-800">Lunch:</span> {lunchTeachers.map(t => t.name).join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm italic">No teachers assigned</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Schedule Summary</h3>
      {activePeriods.map((period) => (
        <div key={period.id} className="p-3 border rounded-md">
          <strong>{period.name} ({period.timeSlot}):</strong>{' '}
          {period.what && activityOptions.find(a => a.value === period.what)?.label}{' '}
          {period.who.length > 0 && `with ${getStaffNamesFromIds(period.who)}`}{' '}
          {period.classInfo && `in ${period.classInfo}`}{' '}
          {period.roomInfo && `(Room: ${period.roomInfo})`}
        </div>
      ))}
    </div>
  );
}; 