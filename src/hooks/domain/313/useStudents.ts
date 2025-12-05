import { createCrudHooks } from '@query/client/factories/crud-factory';
import { StudentZodSchema, Student } from '@/lib/schema/zod-schema/313/student/student';
import { ZodSchema } from 'zod';
import { 
  fetchStudents, 
  fetchStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent
} from '@actions/313/students';
import { useInvalidation } from '@query/cache/invalidation';
import { useCallback } from 'react';
import { useNotifications } from '@/hooks/ui/useNotifications';
import { createDefaultToastConfig } from '@/lib/ui/notifications/toast-configs';
import { FEATURE_FLAGS } from '@/lib/ui/notifications/types';

const studentHooks = createCrudHooks({
  entityType: 'students',
  schema: StudentZodSchema as ZodSchema<Student>,
  serverActions: {
    fetch: fetchStudents,
    fetchById: fetchStudentById,
    create: createStudent,
    update: updateStudent,
    delete: deleteStudent
  },
  validSortFields: ['lastName', 'firstName', 'section', 'teacher', 'gradeLevel', 'createdAt'],
  relatedEntityTypes: []
});

// Export with domain-specific names
const useStudentsList = studentHooks.useList;
const useStudentById = studentHooks.useDetail;
const useStudentsMutations = studentHooks.useMutations;
const useStudentManager = studentHooks.useManager;

// Enhanced manager with specialized student operations
function useStudentManagerWithSpecialization() {
  const manager = useStudentManager();
  const { invalidateList } = useInvalidation();
  
  const refreshStudents = useCallback(async () => {
    await invalidateList('students');
  }, [invalidateList]);
  
  return {
    ...manager,
    refreshStudents
  };
}

// Enhanced: Compose CRUD with notifications
function useStudentsWithNotifications() {
  const notifications = useNotifications();
  const toastConfig = createDefaultToastConfig('students');
  const enableToasts = FEATURE_FLAGS?.ENABLE_TOASTS !== false;
  const mutations = useStudentsMutations();

  return {
    ...mutations,
    updateWithToast: (id: string, data: Partial<Student>) => {
      if (!mutations.updateAsync) throw new Error('updateAsync is not defined');
      return notifications.withToast(
        () => mutations.updateAsync!(id, data),
        toastConfig.update!,
        enableToasts
      );
    }
  };
}

export { 
  useStudentsList, 
  useStudentById, 
  useStudentsMutations, 
  useStudentManager,
  useStudentManagerWithSpecialization,
  useStudentsWithNotifications
};

export const useStudents = {
  list: useStudentsList,
  byId: useStudentById,
  mutations: useStudentsMutations,
  manager: useStudentManager,
  withSpecialization: useStudentManagerWithSpecialization,
  withNotifications: useStudentsWithNotifications
};

export default useStudents; 