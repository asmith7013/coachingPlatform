"use server";

import { NoteModel } from "@mongoose-schema/shared/notes.model";
import { Note, NoteZodSchema, NoteInputZodSchema, NoteInput } from "@zod-schema/shared/notes";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import type { QueryParams } from "@core-types/query";
import { handleServerError } from "@error/handlers/server";
import { ZodType } from "zod";

// Create standard CRUD actions for Notes
const noteActions = createCrudActions({
  model: NoteModel,
  schema: NoteZodSchema as ZodType<Note>,
  inputSchema: NoteInputZodSchema,
  name: "Note",
  revalidationPaths: ["/dashboard/notes"],
  sortFields: ['noteText', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export the generated actions with connection handling
export async function fetchNotes(params: QueryParams) {
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