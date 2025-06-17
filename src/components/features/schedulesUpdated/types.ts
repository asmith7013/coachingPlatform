// src/components/features/schedulesUpdated/types.ts

export interface ScheduleDisplayData {
  schoolId: string;
  date: string;
  teachers: TeacherWithSchedule[];
  bellSchedule: BellScheduleDisplay | null;
  timeSlots: TimeSlotDisplay[];
}

export interface TeacherWithSchedule {
  _id: string;
  staffName: string;
  schedule: TeacherScheduleDisplay | null;
}

export interface BellScheduleDisplay {
  _id: string;
  name: string;
  timeBlocks: TimeSlotDisplay[];
}

export interface TimeSlotDisplay {
  periodNumber: number;
  periodName?: string;
  startTime: string;
  endTime: string;
}

export interface TeacherScheduleDisplay {
  _id: string;
  teacherId: string;
  timeBlocks: TeacherPeriodDisplay[];
}

export interface TeacherPeriodDisplay {
  periodNumber: number;
  className: string;
  room: string;
  activityType: 'teaching' | 'prep' | 'lunch' | 'duty' | 'meeting';
  subject?: string;
  gradeLevel?: string;
}
