import { NYCPSStaff } from '@domain-types/staff';

// School type definition
interface School {
  _id: string;
  schoolName: string;
  district?: string;
  schoolNumber?: string;
  address?: string;
  [key: string]: unknown;
}

// Schedule period UI interface
export interface SchedulePeriodUI {
  id: number;
  name: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  what: string;
  who: string[];
  grade: string;
  classInfo: string;
  roomInfo: string;
}

// Teacher activity types
export type TeacherActivity = 'teaching' | 'prep' | 'lunch';

// Washington teacher period data
export interface TeacherPeriodData {
  periodNum: number;
  activity: TeacherActivity;
  subject?: string;
  room?: string;
}


// Washington teacher data
export interface WashingtonTeacher {
  id: string;
  name: string;
  scheduleByDay: {
    day: string;
    periods: TeacherPeriodData[];
  }[];
}

// Component Props Types
export interface SchoolSelectorProps {
  schools: School[];
  selectedSchool: string;
  onSchoolChange: (schoolId: string) => void;
  isLoading: boolean;
}

export interface ScheduleModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export interface TimeCellProps {
  startTime: string;
  endTime: string;
  timeSlot: string;
  isEditMode: boolean;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  validateTime: (time: string) => boolean;
}

export interface ActivitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string, label: string }>;
}

export interface StaffSelectorProps {
  options: NYCPSStaff[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}

export interface TeacherBadgeProps {
  teacherName: string;
  activity: TeacherActivity;
  subject?: string;
  room?: string;
}

export interface TeacherActivityColumnsProps {
  periodId: number;
  teachers: WashingtonTeacher[];
}

export interface ScheduleRowProps {
  period: SchedulePeriodUI;
  isEditMode: boolean;
  isWashingtonHighSchool: boolean;
  staffOptions: NYCPSStaff[];
  activityOptions: Array<{ value: string, label: string }>;
  washingtonTeachers?: WashingtonTeacher[];
  onStartTimeChange: (id: number, value: string) => void;
  onEndTimeChange: (id: number, value: string) => void;
  onWhatChange: (id: number, value: string) => void;
  onWhoChange: (id: number, value: string[]) => void;
  onClassInfoChange: (id: number, value: string) => void;
  onRoomInfoChange: (id: number, value: string) => void;
  validateTime: (time: string) => boolean;
}

export interface ScheduleTableProps {
  periods: SchedulePeriodUI[];
  isEditMode: boolean;
  isWashingtonHighSchool: boolean;
  staffOptions: NYCPSStaff[];
  activityOptions: Array<{ value: string, label: string }>;
  washingtonTeachers?: WashingtonTeacher[];
  onStartTimeChange: (id: number, value: string) => void;
  onEndTimeChange: (id: number, value: string) => void;
  onWhatChange: (id: number, value: string) => void;
  onWhoChange: (id: number, value: string[]) => void;
  onClassInfoChange: (id: number, value: string) => void;
  onRoomInfoChange: (id: number, value: string) => void;
  validateTime: (time: string) => boolean;
}

export interface ScheduleSummaryProps {
  periods: SchedulePeriodUI[];
  activityOptions: Array<{ value: string, label: string }>;
  getStaffNamesFromIds: (staffIds: string[]) => string;
  isWashingtonHighSchool: boolean;
  washingtonTeachers?: WashingtonTeacher[];
} 