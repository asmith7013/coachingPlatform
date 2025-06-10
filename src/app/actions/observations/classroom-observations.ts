"use server";

import { ClassroomObservationModel } from "@mongoose-schema/observations/classroom-observation.model";
import { ClassroomObservationNote, ClassroomObservationNoteZodSchema, ClassroomObservationNoteInputZodSchema, ClassroomObservationNoteInput } from "@zod-schema/observations/classroom-observation";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { ZodType } from "zod";
import { QueryParams } from "@core-types/query";

// Create standard CRUD actions for ClassroomObservations
const classroomObservationActions = createCrudActions({
  model: ClassroomObservationModel,
  schema: ClassroomObservationNoteZodSchema as ZodType<ClassroomObservationNote>,
  inputSchema: ClassroomObservationNoteInputZodSchema as ZodType<ClassroomObservationNoteInput>,
  name: "ClassroomObservation",
  revalidationPaths: ["/dashboard/observations", "/dashboard/classroom-observations"],
  sortFields: ['date', 'teacherId', 'status', 'createdAt', 'updatedAt'],
  defaultSortField: 'date',
  defaultSortOrder: 'desc'
});

// Export the generated actions with connection handling
export async function fetchClassroomObservations(params: QueryParams) {
  return withDbConnection(() => classroomObservationActions.fetch(params));
}

export async function createClassroomObservation(data: ClassroomObservationNoteInput) {
  return withDbConnection(() => classroomObservationActions.create(data));
}

export async function updateClassroomObservation(id: string, data: Partial<ClassroomObservationNoteInput>) {
  return withDbConnection(() => classroomObservationActions.update(id, data));
}

export async function deleteClassroomObservation(id: string) {
  return withDbConnection(() => classroomObservationActions.delete(id));
}

export async function fetchClassroomObservationById(id: string) {
  return withDbConnection(() => classroomObservationActions.fetchById(id));
}

// Add specialized actions
export async function fetchObservationsByTeacher(teacherId: string) {
  return withDbConnection(async () => {
    try {
      const results = await ClassroomObservationModel.find({ teacherId })
        .sort({ date: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => ClassroomObservationNoteZodSchema.parse(item)),
        total: results.length
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
}

export async function fetchObservationsByVisit(visitId: string) {
  return withDbConnection(async () => {
    try {
      const results = await ClassroomObservationModel.find({ visitId })
        .sort({ date: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => ClassroomObservationNoteZodSchema.parse(item)),
        total: results.length
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
} 