"use server";

import { ContextualNoteModel } from "@mongoose-schema/visits/classroom-observation.model";
import { ContextualNote, ContextualNoteZodSchema, ContextualNoteInputZodSchema, ContextualNoteInput } from "@zod-schema/visits/classroom-observation";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { ZodType } from "zod";
import { QueryParams } from "@core-types/query";

// Create standard CRUD actions for ContextualNotes
const contextualNoteActions = createCrudActions({
  model: ContextualNoteModel,
  schema: ContextualNoteZodSchema as ZodType<ContextualNote>,
  inputSchema: ContextualNoteInputZodSchema as ZodType<ContextualNoteInput>,
  name: "ContextualNote",
  revalidationPaths: ["/dashboard/observations", "/dashboard/notes"],
  sortFields: ['content', 'noteType', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export the generated actions with connection handling
export async function fetchContextualNotes(params: QueryParams) {
  return withDbConnection(() => contextualNoteActions.fetch(params));
}

export async function createContextualNote(data: ContextualNoteInput) {
  return withDbConnection(() => contextualNoteActions.create(data));
}

export async function updateContextualNote(id: string, data: Partial<ContextualNoteInput>) {
  return withDbConnection(() => contextualNoteActions.update(id, data));
}

export async function deleteContextualNote(id: string) {
  return withDbConnection(() => contextualNoteActions.delete(id));
}

export async function fetchContextualNoteById(id: string) {
  return withDbConnection(() => contextualNoteActions.fetchById(id));
}

// Add specialized actions following pattern from notes.ts
export async function fetchContextualNotesByVisit(visitId: string) {
  return withDbConnection(async () => {
    try {
      const results = await ContextualNoteModel.find({ visitId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map((item: ContextualNote) => ContextualNoteZodSchema.parse(item)),
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

export async function fetchContextualNotesByType(noteType: string) {
  return withDbConnection(async () => {
    try {
      const results = await ContextualNoteModel.find({ noteType })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => ContextualNoteZodSchema.parse(item)),
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