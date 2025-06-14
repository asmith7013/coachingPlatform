import { createCrudHooks } from '@query/client/factories/crud-factory';
import { CapImplementationRecord, CapImplementationRecordZodSchema } from '@zod-schema/cap/cap-implementation-record';
import {
  fetchCapImplementationRecords,
  createCapImplementationRecord,
  updateCapImplementationRecord,
  deleteCapImplementationRecord
} from '@actions/coaching/cap-implementation-records';
import { ZodType } from 'zod';

const capImplementationRecordHooks = createCrudHooks({
  entityType: 'capImplementationRecords',
  schema: CapImplementationRecordZodSchema as ZodType<CapImplementationRecord>,
  serverActions: {
    fetch: fetchCapImplementationRecords,
    create: createCapImplementationRecord,
    update: updateCapImplementationRecord,
    delete: deleteCapImplementationRecord
  },
  validSortFields: ['title', 'visitNumber', 'sortOrder', 'createdAt'],
  relatedEntityTypes: ['coachingActionPlans']
});

export function useCapImplementationRecordsByCapId(capId: string) {
  return capImplementationRecordHooks.useList({ filters: { capId }, sortBy: 'visitNumber' });
}

export const useCapImplementationRecords = {
  list: capImplementationRecordHooks.useList,
  mutations: capImplementationRecordHooks.useMutations,
  manager: capImplementationRecordHooks.useManager,
  byCapId: useCapImplementationRecordsByCapId
}; 