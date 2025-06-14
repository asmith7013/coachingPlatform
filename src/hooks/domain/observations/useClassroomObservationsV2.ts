import { createCrudHooks } from '@query/client/factories/crud-factory';
import {
  ClassroomObservationV2ZodSchema,
  ClassroomObservationV2,
//   ClassroomObservationV2Input
} from '@zod-schema/observations/classroom-observation-v2';
import {
  fetchClassroomObservationsV2,
  fetchClassroomObservationV2ById,
  createClassroomObservationV2,
  updateClassroomObservationV2,
  deleteClassroomObservationV2
} from '@actions/observations/classroom-observations-v2';
import { ZodSchema } from 'zod';

const classroomObservationV2Hooks = createCrudHooks({
  entityType: 'classroom-observations-v2',
  schema: ClassroomObservationV2ZodSchema as ZodSchema<ClassroomObservationV2>,
  serverActions: {
    fetch: fetchClassroomObservationsV2,
    fetchById: fetchClassroomObservationV2ById,
    create: createClassroomObservationV2,
    update: updateClassroomObservationV2,
    delete: deleteClassroomObservationV2
  },
  validSortFields: ['date', 'teacherId', 'status', 'createdAt', 'updatedAt'],
  relatedEntityTypes: []
});

const useClassroomObservationsV2List = classroomObservationV2Hooks.useList;
const useClassroomObservationsV2ById = classroomObservationV2Hooks.useDetail;
const useClassroomObservationsV2Mutations = classroomObservationV2Hooks.useMutations;
const useClassroomObservationsV2Manager = classroomObservationV2Hooks.useManager;

export const useClassroomObservationsV2 = {
  list: useClassroomObservationsV2List,
  byId: useClassroomObservationsV2ById,
  mutations: useClassroomObservationsV2Mutations,
  manager: useClassroomObservationsV2Manager
};

export default useClassroomObservationsV2; 