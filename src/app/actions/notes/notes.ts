"use server";

import { NoteModel } from "@mongoose-schema/shared/notes.model";
import { NoteZodSchema, NoteInputZodSchema } from "@zod-schema/shared/notes";
import { createCrudActions } from "@data-server/crud/crud-action-factory";
import { withDbConnection } from "@data-server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { NoteInput } from "@zod-schema/shared/notes";

// Create standard CRUD actions for Notes
export const noteActions = createCrudActions({
  model: NoteModel,
  fullSchema: NoteZodSchema,
  inputSchema: NoteInputZodSchema,
  revalidationPaths: ["/dashboard/notes"],
  options: {
    validSortFields: ['date', 'type', 'createdAt', 'updatedAt'],
    defaultSortField: 'date',
    defaultSortOrder: 'desc',
    entityName: 'Note'
  }
});

// Export the generated actions with connection handling
export async function fetchNotes(params = {}) {
  return withDbConnection(() => noteActions.fetch(params));
}

export async function createNote(data: NoteInput) {
  return withDbConnection(() => noteActions.create(data));
}

export async function updateNote(id: string, data: Partial<NoteInput>) {
  return withDbConnection(() => noteActions.update(id, data));
}

export async function deleteNote(id: string) {
  return withDbConnection(() => noteActions.delete(id));
}

export async function fetchNoteById(id: string) {
  return withDbConnection(() => noteActions.fetchById(id));
}

// Add specialized actions
export async function fetchNotesByType(type: string) {
  return withDbConnection(async () => {
    try {
      const results = await NoteModel.find({ type })
        .sort({ date: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => NoteZodSchema.parse(item)),
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

export async function fetchNotesByDateRange(startDate: string, endDate: string) {
  return withDbConnection(async () => {
    try {
      const results = await NoteModel.find({
        date: { 
          $gte: startDate,
          $lte: endDate 
        }
      })
        .sort({ date: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => NoteZodSchema.parse(item)),
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