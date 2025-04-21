import { FieldOverrideMap } from '@/lib/ui-schema/types';

// Placeholder for ScheduleInput type - to be properly imported once created
type ScheduleInput = {
  school: string;
  bellScheduleType: string;
  classSchedule: unknown[];
  assignedCycleDays: unknown[];
  owners: string[];
};

export const ScheduleOverrides: FieldOverrideMap<ScheduleInput> = {
  school: {
    type: 'reference',
    label: 'School',
    url: '/api/schools',
    helpText: 'The school this schedule belongs to',
    required: true,
  },
  bellScheduleType: {
    type: 'select',
    label: 'Bell Schedule Type',
    helpText: 'The type of bell schedule (Regular, Half-Day, etc.)',
    required: true,
  },
  classSchedule: {
    type: 'multi-select',
    label: 'Class Schedule',
    helpText: 'The classes scheduled for this schedule',
    multiple: true,
    required: true,
  },
  assignedCycleDays: {
    type: 'multi-select',
    label: 'Assigned Cycle Days',
    helpText: 'The cycle days assigned to this schedule',
    multiple: true,
    required: true,
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/staff',
    helpText: 'Staff members responsible for managing this schedule',
    multiple: true,
    required: true,
  },
}; 