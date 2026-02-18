import mongoose, { type Model } from "mongoose";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { NYCPSStaffModel } from "@mongoose-schema/core/staff.model";

/**
 * Shared repository helpers for SkillsHub server actions.
 * Extracts common patterns: serialization, auth, teacher queries, etc.
 */

// ─── Serialization ───────────────────────────────────────────────

export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function serializeMany<T>(docs: unknown[]): T[] {
  return docs.map((d) => JSON.parse(JSON.stringify(d))) as T[];
}

// ─── Authentication ──────────────────────────────────────────────

export async function getAuthStaffId(): Promise<string> {
  const authResult = await getAuthenticatedUser();
  if (!authResult.success) {
    throw new Error("Unauthorized");
  }
  const staffId = authResult.data.metadata.staffId;
  if (!staffId) {
    throw new Error("No staffId found for authenticated user");
  }
  return staffId;
}

// ─── Common Queries ──────────────────────────────────────────────

export async function findByTeacher<T>(
  model: Model<unknown>,
  teacherStaffId: string,
  sort: Record<string, 1 | -1> = { createdAt: -1 },
): Promise<T[]> {
  const docs = await model.find({ teacherStaffId }).sort(sort).lean();
  return serializeMany<T>(docs);
}

export async function findByIdOrThrow<T>(
  model: Model<unknown>,
  id: string,
): Promise<T> {
  const doc = await model.findById(id).lean();
  if (!doc) {
    throw new Error("Not found");
  }
  return serialize<T>(doc);
}

// ─── Validation ──────────────────────────────────────────────────

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Staff Queries ───────────────────────────────────────────────

export interface StaffOption {
  _id: string;
  staffName: string;
  email?: string;
  schoolIds?: string[];
}

export async function findStaffByRole(role: string): Promise<StaffOption[]> {
  const docs = await NYCPSStaffModel.find({ rolesNYCPS: role })
    .select("staffName email schoolIds")
    .sort({ staffName: 1 })
    .lean();
  return serializeMany<StaffOption>(docs);
}
