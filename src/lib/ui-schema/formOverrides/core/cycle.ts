import { CycleInput } from '@/lib/zod-schema/core/cycle';
import { FieldOverrideMap } from '@/lib/ui-schema/types';

export const CycleOverrides: FieldOverrideMap<CycleInput> = {
  cycleNum: {
    type: 'number',
    label: 'Cycle Number',
    helpText: 'Sequential number for this cycle',
    required: true,
  },
  ipgIndicator: {
    type: 'text',
    label: 'IPG Indicator',
    helpText: 'Instructional Practice Guide indicator for this cycle',
  },
  implementationIndicator: {
    type: 'text',
    label: 'Implementation Indicator',
    helpText: 'Primary implementation indicator for this cycle',
    required: true,
  },
  supportCycle: {
    type: 'select',
    label: 'Support Cycle Type',
    helpText: 'The type of support cycle (Launch, Sustain, Monitor)',
  },
  lookFors: {
    type: 'reference',
    label: 'Look Fors',
    url: '/api/look-fors',
    multiple: true,
    helpText: 'Look For items associated with this cycle',
    required: true,
  },
  owners: {
    type: 'reference',
    label: 'Owners',
    url: '/api/staff',
    multiple: true,
    helpText: 'Staff members responsible for this cycle',
    required: true,
  },
};
