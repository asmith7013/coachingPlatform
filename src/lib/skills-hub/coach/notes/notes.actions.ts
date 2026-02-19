"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";
import { serialize, serializeMany } from "../../core/repository";
import { SkillsHubSkillNote } from "./skill-note.model";
import {
  SkillNoteInputSchema,
  type SkillNoteInput,
  type SkillNoteDocument,
} from "./note.types";

export async function getNotes(
  teacherStaffId: string,
  filters?: { skillId?: string; actionPlanId?: string },
): Promise<{
  success: boolean;
  data?: SkillNoteDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const query: Record<string, unknown> = { teacherStaffId };

      if (filters?.skillId) {
        query["tags.skillIds"] = filters.skillId;
      }
      if (filters?.actionPlanId) {
        query["tags.actionPlanIds"] = filters.actionPlanId;
      }

      const docs = await SkillsHubSkillNote.find(query)
        .sort({ createdAt: -1 })
        .lean();
      const data = serializeMany<SkillNoteDocument>(docs);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getNotes"),
      };
    }
  });
}

export async function createNote(input: SkillNoteInput): Promise<{
  success: boolean;
  data?: SkillNoteDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult.success) {
        return { success: false, error: "Unauthorized" };
      }

      const validated = SkillNoteInputSchema.parse(input);

      const doc = await SkillsHubSkillNote.create({
        ...validated,
        authorId: authResult.data.metadata.staffId,
      });

      const data = serialize<SkillNoteDocument>(doc.toObject());
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "createNote"),
      };
    }
  });
}

export async function updateNote(
  noteId: string,
  input: Partial<SkillNoteInput>,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      await SkillsHubSkillNote.findByIdAndUpdate(noteId, { $set: input });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "updateNote"),
      };
    }
  });
}

export async function deleteNote(
  noteId: string,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      await SkillsHubSkillNote.findByIdAndDelete(noteId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "deleteNote"),
      };
    }
  });
}
