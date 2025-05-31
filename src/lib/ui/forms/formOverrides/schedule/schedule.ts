import { FieldOverrideMap } from '@ui-types/form';
// import { BellScheduleInput } from '@zod-schema/schedule/schedule';

export const BellScheduleOverrides: FieldOverrideMap = {
  school: {
    type: 'reference',
    label: 'School',
    url: '/api/reference/schools',
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
    required: true,
  },
  assignedCycleDays: {
    type: 'multi-select',
    label: 'Assigned Cycle Days',
    helpText: 'The cycle days assigned to this schedule',
    required: true,
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/reference/staff',
    helpText: 'Staff members responsible for managing this schedule',
    required: true,
  },
}; 