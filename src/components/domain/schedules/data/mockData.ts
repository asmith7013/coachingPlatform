import { EventTypeZod } from '@enums';
import { SchedulePeriodUI, WashingtonTeacher } from './scheduleTypes';

// Activity types for "What" dropdown based on EventTypeZod
export const ACTIVITY_TYPES = EventTypeZod.options.map(value => ({
  value,
  label: value
}));

// Additional event types that aren't in the standard enum
export const EXTENDED_ACTIVITY_TYPES = [
  ...ACTIVITY_TYPES,
  { value: "planning", label: "Planning" },
  { value: "lunch", label: "Lunch" },
  { value: "plc", label: "PLC" },
  { value: "pre-meeting", label: "Pre-Meeting" }
];

// Mock data for staff class and room assignments
export const STAFF_CLASS_ASSIGNMENTS: Record<string, { className: string, roomNumber: string }> = {
  'staff1': { className: 'Math 101', roomNumber: '204A' },
  'staff2': { className: 'English Literature', roomNumber: '105B' },
  'staff3': { className: 'Science', roomNumber: '302C' }
};

// Washington High School data
export const WASHINGTON_HIGH_SCHOOL = {
  id: "washington-high",
  name: "Washington High School",
  bellSchedule: [
    { period: 1, timeSlot: "8:00-8:50" },
    { period: 2, timeSlot: "8:55-9:45" },
    { period: 3, timeSlot: "9:50-10:40" },
    { period: 4, timeSlot: "10:40-10:55" },
    { period: 5, timeSlot: "10:55-11:45" },
    { period: 6, timeSlot: "11:45-12:25" },
    { period: 7, timeSlot: "12:30-1:20" },
    { period: 8, timeSlot: "1:25-2:15" },
    { period: 9, timeSlot: "2:20-3:10" },
    { period: 10, timeSlot: "3:15-4:30" }
  ]
};

// Washington High School Teachers with schedules
export const WASHINGTON_TEACHERS: WashingtonTeacher[] = [
  {
    id: "teacher1",
    name: "Ms. Johnson",
    scheduleByDay: [
      {
        day: "uniform",
        periods: [
          { periodNum: 1, activity: "teaching", subject: "Algebra I", room: "204" },
          { periodNum: 2, activity: "prep" },
          { periodNum: 3, activity: "prep" },
          { periodNum: 4, activity: "prep" },
          { periodNum: 5, activity: "teaching", subject: "World History", room: "201" },
          { periodNum: 6, activity: "lunch" },
          { periodNum: 7, activity: "prep" },
          { periodNum: 8, activity: "teaching", subject: "Pre-Calculus", room: "204" },
          { periodNum: 9, activity: "prep" },
          { periodNum: 10, activity: "prep" }
        ]
      }
    ]
  },
  {
    id: "teacher2",
    name: "Mr. Rodriguez",
    scheduleByDay: [
      {
        day: "uniform",
        periods: [
          { periodNum: 1, activity: "prep" },
          { periodNum: 2, activity: "prep" },
          { periodNum: 3, activity: "teaching", subject: "Biology", room: "302" },
          { periodNum: 4, activity: "prep" },
          { periodNum: 5, activity: "prep" },
          { periodNum: 6, activity: "lunch" },
          { periodNum: 7, activity: "prep" },
          { periodNum: 8, activity: "prep" },
          { periodNum: 9, activity: "prep" },
          { periodNum: 10, activity: "prep" }
        ]
      }
    ]
  },
  {
    id: "teacher3",
    name: "Mrs. Davis",
    scheduleByDay: [
      {
        day: "uniform",
        periods: [
          { periodNum: 1, activity: "prep" },
          { periodNum: 2, activity: "teaching", subject: "English Composition", room: "105" },
          { periodNum: 3, activity: "prep" },
          { periodNum: 4, activity: "prep" },
          { periodNum: 5, activity: "prep" },
          { periodNum: 6, activity: "lunch" },
          { periodNum: 7, activity: "prep" },
          { periodNum: 8, activity: "prep" },
          { periodNum: 9, activity: "prep" },
          { periodNum: 10, activity: "prep" }
        ]
      }
    ]
  },
  {
    id: "teacher4",
    name: "Dr. Wilson",
    scheduleByDay: [
      {
        day: "uniform",
        periods: [
          { periodNum: 1, activity: "prep" },
          { periodNum: 2, activity: "prep" },
          { periodNum: 3, activity: "prep" },
          { periodNum: 4, activity: "prep" },
          { periodNum: 5, activity: "teaching", subject: "World History", room: "201" },
          { periodNum: 6, activity: "lunch" },
          { periodNum: 7, activity: "prep" },
          { periodNum: 8, activity: "prep" },
          { periodNum: 9, activity: "prep" },
          { periodNum: 10, activity: "prep" }
        ]
      }
    ]
  },
  {
    id: "teacher5",
    name: "Ms. Chen",
    scheduleByDay: [
      {
        day: "uniform",
        periods: [
          { periodNum: 1, activity: "prep" },
          { periodNum: 2, activity: "prep" },
          { periodNum: 3, activity: "prep" },
          { periodNum: 4, activity: "prep" },
          { periodNum: 5, activity: "prep" },
          { periodNum: 6, activity: "lunch" },
          { periodNum: 7, activity: "teaching", subject: "Studio Art", room: "107" },
          { periodNum: 8, activity: "prep" },
          { periodNum: 9, activity: "prep" },
          { periodNum: 10, activity: "prep" }
        ]
      }
    ]
  },
  {
    id: "teacher6",
    name: "Mr. Thompson",
    scheduleByDay: [
      {
        day: "uniform",
        periods: [
          { periodNum: 1, activity: "prep" },
          { periodNum: 2, activity: "prep" },
          { periodNum: 3, activity: "prep" },
          { periodNum: 4, activity: "prep" },
          { periodNum: 5, activity: "prep" },
          { periodNum: 6, activity: "lunch" },
          { periodNum: 7, activity: "prep" },
          { periodNum: 8, activity: "prep" },
          { periodNum: 9, activity: "teaching", subject: "Physical Education", room: "Gymnasium" },
          { periodNum: 10, activity: "teaching", subject: "Enrichment", room: "Gymnasium" }
        ]
      }
    ]
  }
];

// Initial schedule periods structure with Washington High School bell schedule
export const DEFAULT_PERIODS: SchedulePeriodUI[] = [
  { id: 1, name: "Period 1", timeSlot: "8:00-8:50", startTime: "8:00", endTime: "8:50", what: "", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 2, name: "Period 2", timeSlot: "8:55-9:45", startTime: "8:55", endTime: "9:45", what: "", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 3, name: "Period 3", timeSlot: "9:50-10:40", startTime: "9:50", endTime: "10:40", what: "", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 4, name: "BREAK", timeSlot: "10:40-10:55", startTime: "10:40", endTime: "10:55", what: "break", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 5, name: "Period 4", timeSlot: "10:55-11:45", startTime: "10:55", endTime: "11:45", what: "", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 6, name: "LUNCH", timeSlot: "11:45-12:25", startTime: "11:45", endTime: "12:25", what: "lunch", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 7, name: "Period 5", timeSlot: "12:30-1:20", startTime: "12:30", endTime: "1:20", what: "", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 8, name: "Period 6", timeSlot: "1:25-2:15", startTime: "1:25", endTime: "2:15", what: "", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 9, name: "Period 7", timeSlot: "2:20-3:10", startTime: "2:20", endTime: "3:10", what: "", who: [], grade: "", classInfo: "", roomInfo: "" },
  { id: 10, name: "After School", timeSlot: "3:15-4:30", startTime: "3:15", endTime: "4:30", what: "enrichment", who: [], grade: "", classInfo: "", roomInfo: "" }
]; 