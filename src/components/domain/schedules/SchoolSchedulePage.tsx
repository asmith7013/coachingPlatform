'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@components/core/Button';
import { Card } from '@components/composed/cards';
import { PageHeader } from '@components/composed/layouts/PageHeader';
import { useSchoolsList } from '@hooks/domain/useSchools';
import { useNYCPSStaffList } from '@hooks/domain/useNYCPSStaff';
import { useTeacherSchedules } from '@hooks/domain/useTeacherSchedules';

import { TeacherSchedule } from '@zod-schema/schedule/schedule';

// Import components
import { ScheduleModeToggle } from './components/ScheduleModeToggle';
import { ScheduleTable } from './components/ScheduleTable';
import { ScheduleSummary } from './components/ScheduleSummary';

// Import utils and data
import { validateTime } from './utils/TimeValidator';
import { validateSchedule } from './utils/scheduleHelpers';
import { DEFAULT_PERIODS, EXTENDED_ACTIVITY_TYPES } from './data/mockData';
import { SchedulePeriodUI, TeacherPeriodData } from './data/scheduleTypes';

// Default Washington High School ID
const WASHINGTON_HIGH_SCHOOL_ID = "washington-high";

// Interface for period data in the database
interface DatabasePeriod {
  periodNum: number;
  className: string;
  periodType: string;
  room?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Main School Schedule Page Component
 */
const SchoolSchedulePage: React.FC = () => {
  // Fetch schools, staff, and schedules data with React Query hooks
  const { items: _schools = [] } = useSchoolsList();
  const { items: staff = [], isLoading: staffLoading } = useNYCPSStaffList();
  const { 
    schedulesForUI = [], 
    schedules = [],
    isLoading: schedulesLoading, 
    createSchedule 
  } = useTeacherSchedules(WASHINGTON_HIGH_SCHOOL_ID);
  
  // Local state
  const [periods, setPeriods] = useState<SchedulePeriodUI[]>(
    // Initialize with scheduleForUI data if available, otherwise use defaults
    schedulesForUI.length > 0 
      ? schedulesForUI.flatMap(s => s.scheduleData)
          .filter((p, i, arr) => arr.findIndex(item => item.id === p.id) === i)
          .sort((a, b) => a.id - b.id)
          .map(p => ({
            ...p,
            name: p.classInfo || '',
            grade: ''
          })) as SchedulePeriodUI[]
      : DEFAULT_PERIODS
  );
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Filtered staff for Washington High School
  const schoolStaff = useMemo(() => {
    if (staffLoading || staff.length === 0) return [];
    
    const washingtonStaff = staff.filter(member => 
      member.schools?.includes(WASHINGTON_HIGH_SCHOOL_ID)
    );
    
    return washingtonStaff.length > 0 ? washingtonStaff : staff.slice(0, 6);
  }, [staff, staffLoading]);
  
  // Transform schedules into WashingtonTeacher format
  const washingtonTeachers = useMemo(() => {
    if (!schedules || !staff) return [];
    
    return (schedules as unknown as TeacherSchedule[]).map((schedule: TeacherSchedule) => {
      // Find staff member for this schedule
      const teacher = staff.find(s => s._id === schedule.teacher);
      
      // Create periods data
      const teacherPeriods: TeacherPeriodData[] = [];
      
      // Extract period data from the first day's schedule
      if (schedule.scheduleByDay && schedule.scheduleByDay.length > 0) {
        const day = schedule.scheduleByDay[0];
        
        day.periods.forEach((period: DatabasePeriod) => {
          teacherPeriods.push({
            periodNum: period.periodNum,
            // Determine activity based on period type or class name
            activity: period.periodType === 'prep' ? 'prep' : 
                      period.periodType === 'lunch' ? 'lunch' : 'teaching',
            subject: period.className,
            room: period.room
          });
        });
      }
      
      // Create WashingtonTeacher object
      return {
        id: schedule.teacher,
        name: teacher?.staffName || `Teacher ${schedule.teacher}`,
        scheduleByDay: [{
          day: "uniform",
          periods: teacherPeriods
        }]
      };
    });
  }, [schedules, staff]);

  // Handle changing the start time
  const handleStartTimeChange = (periodId: number, value: string): void => {
    setPeriods(periods.map(period => 
      period.id === periodId ? { 
        ...period, 
        startTime: value,
        timeSlot: `${value}-${period.endTime}` // Update the combined timeSlot
      } : period
    ));
  };

  // Handle changing the end time
  const handleEndTimeChange = (periodId: number, value: string): void => {
    setPeriods(periods.map(period => 
      period.id === periodId ? { 
        ...period, 
        endTime: value,
        timeSlot: `${period.startTime}-${value}` // Update the combined timeSlot
      } : period
    ));
  };
  
  // Handle changing the activity type (What)
  const handleWhatChange = (periodId: number, value: string): void => {
    setPeriods(periods.map(period => 
      period.id === periodId ? { ...period, what: value } : period
    ));
  };
  
  // Handle changing the staff (Who)
  const handleWhoChange = (periodId: number, selectedStaff: string[]): void => {
    setPeriods(periods.map(period => {
      if (period.id === periodId) {
        return { 
          ...period, 
          who: selectedStaff,
        };
      }
      return period;
    }));
  };

  // Handle changing class info
  const handleClassInfoChange = (periodId: number, value: string): void => {
    setPeriods(periods.map(period => 
      period.id === periodId ? { ...period, classInfo: value } : period
    ));
  };

  // Handle changing room info
  const handleRoomInfoChange = (periodId: number, value: string): void => {
    setPeriods(periods.map(period => 
      period.id === periodId ? { ...period, roomInfo: value } : period
    ));
  };
  
  // Get staff names from IDs for display
  const getStaffNamesFromIds = (staffIds: string[]): string => {
    return staffIds
      .map(id => staff.find(s => s._id === id)?.staffName || id)
      .filter(Boolean)
      .join(", ");
  };
  
  // Handler for saving the schedule
  const handleSaveSchedule = async (): Promise<void> => {
    if (!validateSchedule(periods, validateTime)) {
      alert("Please fix validation errors before saving");
      return;
    }
    
    // Check if createSchedule is available
    if (!createSchedule) {
      alert("Schedule creation is not available");
      return;
    }
    
    try {
      // Create a schedule entry for each teacher
      const teacherIds = [...new Set(periods.flatMap(p => p.who))];
      
      for (const teacherId of teacherIds) {
        // Get periods for this teacher
        const teacherPeriods = periods.filter(p => p.who.includes(teacherId));
        
        // Map to the format expected by the database
        const scheduleData = {
          teacher: teacherId,
          school: WASHINGTON_HIGH_SCHOOL_ID,
          scheduleByDay: [{
            day: "uniform" as const,
            periods: teacherPeriods.map(p => ({
              periodNum: p.id,
              className: p.classInfo || p.what,
              periodType: "class" as const,
              room: p.roomInfo || "",
              startTime: p.startTime,
              endTime: p.endTime
            }))
          }],
          owners: ["system"]
        };
        
        // Save the schedule
        await createSchedule(scheduleData as unknown as TeacherSchedule);
      }
      
      alert("Schedules saved successfully!");
      // Switch back to view mode after saving
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving schedules:", error);
      alert("Error saving schedules. See console for details.");
    }
  };
  
  // Return JSX with washingtonTeachers prop passed to components
  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Washington High School Schedule" />
      
      {/* Schedule Table */}
      <Card>
        <div className="p-4">
          <ScheduleTable
            periods={periods}
            isEditMode={isEditMode}
            isWashingtonHighSchool={true}
            staffOptions={schoolStaff}
            activityOptions={EXTENDED_ACTIVITY_TYPES}
            washingtonTeachers={washingtonTeachers.length > 0 ? washingtonTeachers : undefined}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onWhatChange={handleWhatChange}
            onWhoChange={handleWhoChange}
            onClassInfoChange={handleClassInfoChange}
            onRoomInfoChange={handleRoomInfoChange}
            validateTime={validateTime}
          />
          
          <div className="mt-4 flex justify-end gap-2">
            <ScheduleModeToggle
              isEditMode={isEditMode}
              onToggle={() => setIsEditMode(!isEditMode)}
            />
            <Button 
              onClick={handleSaveSchedule}
              disabled={schedulesLoading}
            >
              Save Schedule
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Display Schedule Summary */}
      <Card className="mt-6">
        <div className="bg-gray-100 p-4 border-b">
          <h2 className="text-lg font-semibold">Schedule Summary</h2>
        </div>
        <div className="p-4">
          <ScheduleSummary
            periods={periods}
            activityOptions={EXTENDED_ACTIVITY_TYPES}
            getStaffNamesFromIds={getStaffNamesFromIds}
            isWashingtonHighSchool={true}
            washingtonTeachers={washingtonTeachers.length > 0 ? washingtonTeachers : undefined}
          />
        </div>
      </Card>
    </div>
  );
};

export default SchoolSchedulePage;