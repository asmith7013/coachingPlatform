import React, { useMemo, useEffect } from 'react';
import { TeacherBadge } from './TeacherBadge';
import { TeacherActivityColumnsProps } from '../data/scheduleTypes';
import { getTeachersByPeriodAndActivity } from '../utils/scheduleHelpers';

/**
 * Component for displaying teacher activity columns (teaching, prep, lunch)
 */
export const TeacherActivityColumns: React.FC<TeacherActivityColumnsProps> = ({
  periodId,
  teachers = []
}) => {
  // Use useMemo to wrap the initialization of teachersData
  const teachersData = useMemo(() => teachers || [], [teachers]);
  
  // Get teachers by activity type for this period
  const teachingTeachers = useMemo(() => 
    getTeachersByPeriodAndActivity(periodId, 'teaching', teachersData),
    [periodId, teachersData]
  );
  
  const prepTeachers = useMemo(() => 
    getTeachersByPeriodAndActivity(periodId, 'prep', teachersData),
    [periodId, teachersData]
  );
  
  const lunchTeachers = useMemo(() => 
    getTeachersByPeriodAndActivity(periodId, 'lunch', teachersData),
    [periodId, teachersData]
  );
  
  // Log data for debugging
  useEffect(() => {
    console.log(`TeacherActivityColumns - periodId: ${periodId}`, {
      teachersAvailable: teachersData.length,
      teachingTeachers,
      prepTeachers,
      lunchTeachers
    });
  }, [periodId, teachersData, teachingTeachers, prepTeachers, lunchTeachers]);
  
  // Render empty placeholder when no teachers are available
  const renderEmptyPlaceholder = () => (
    <div className="text-gray-400 text-xs italic">No teachers assigned</div>
  );
  
  return (
    <>
      <td className="py-2 px-4 border bg-green-50">
        {teachingTeachers.length > 0 ? (
          teachingTeachers.map(teacher => {
            const periodData = teacher.scheduleByDay?.[0]?.periods.find(p => p.periodNum === periodId);
            return (
              <TeacherBadge
                key={teacher.id}
                teacherName={teacher.name}
                activity="teaching"
                subject={periodData?.subject}
                room={periodData?.room}
              />
            );
          })
        ) : renderEmptyPlaceholder()}
      </td>
      
      <td className="py-2 px-4 border bg-purple-50">
        {prepTeachers.length > 0 ? (
          prepTeachers.map(teacher => (
            <TeacherBadge
              key={teacher.id}
              teacherName={teacher.name}
              activity="prep"
            />
          ))
        ) : renderEmptyPlaceholder()}
      </td>
      
      <td className="py-2 px-4 border bg-orange-50">
        {lunchTeachers.length > 0 ? (
          lunchTeachers.map(teacher => (
            <TeacherBadge
              key={teacher.id}
              teacherName={teacher.name}
              activity="lunch"
            />
          ))
        ) : renderEmptyPlaceholder()}
      </td>
    </>
  );
};