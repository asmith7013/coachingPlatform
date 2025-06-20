import React from 'react';
import { Button } from '@/components/core/Button';
import { Heading, Text } from '@/components/core/typography';
import type { NYCPSStaff } from '@zod-schema/core/staff';
import type { TeacherSchedule } from '@zod-schema/schedules/schedule-documents';
import { getTeacherSchedule } from '@/lib/schema/reference/schedules';

interface TeacherSelectionPanelProps {
  teachers: NYCPSStaff[];
  teacherSchedules: TeacherSchedule[];
  selectedTeacher: string | null;
  onTeacherSelect: (teacherId: string) => void;
}

export const TeacherSelectionPanel: React.FC<TeacherSelectionPanelProps> = ({
  teachers,
  teacherSchedules,
  selectedTeacher,
  onTeacherSelect
}) => {
  return (
    <div className="space-y-4">
      <Heading level="h2">Select Teacher</Heading>
      <div className="flex flex-wrap gap-3">
        {teachers.map((teacher) => {
          const schedule = getTeacherSchedule(teacherSchedules, teacher._id);
          return (
            <Button
              key={teacher._id}
              intent={selectedTeacher === teacher._id ? "primary" : "secondary"}
              appearance="solid"
              onClick={() => onTeacherSelect(teacher._id)}
              className="flex flex-col items-start p-4 min-w-[200px] h-auto"
            >
              <Text className="font-semibold text-left">{teacher.staffName}</Text>
              <Text className="text-sm opacity-75 text-left">
                {schedule ? `${schedule.timeBlocks?.length || 0} periods scheduled` : 'No schedule'}
              </Text>
            </Button>
          );
        })}
      </div>
    </div>
  );
}; 