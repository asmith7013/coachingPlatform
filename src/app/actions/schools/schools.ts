"use server";

import { SchoolZodSchema } from "@/lib/zod-schema/core/school"; // Import the Zod schema for validation.
import { SchoolModel } from "@/models/Mongoose.model"; // Import the Mongoose model.
import { connectToDB } from "@/lib/db"; // Import the database connection function.
import { handleServerError } from "@/lib/handleServerError"; // Import the error handling function.
import { revalidatePath } from "next/cache"; // Import revalidatePath for cache invalidation.
import { validate } from "@/lib/zod-schema"; // Import validation function.
import mongoose from "mongoose"; // Import mongoose for ObjectId.
import * as Sentry from "@sentry/nextjs"; // Import Sentry for error tracking.
import { ZodError } from "zod"; // Import ZodError for validation errors.
import type { SortOrder } from "mongoose"; // Import SortOrder type from mongoose.
import { School } from "@/lib/zod-schema"; // Import the School type.

/** Fetch Schools */
export async function fetchSchools(
  page: number = 1,
  limit: number = 20,
  filters: Partial<School> = {},
  sortBy: Record<string, SortOrder> = { createdAt: -1 },
  performanceMode: boolean = true
): Promise<{ schools: School[]; total: number }> {
  try {
    await connectToDB();

    const query: Record<string, unknown> = {};
    if (filters.schoolName) query.schoolName = { $regex: filters.schoolName, $options: "i" };
    if (filters.district) query.district = { $regex: filters.district, $options: "i" };
    if (filters.gradeLevelsSupported?.length)
      query.gradeLevelsSupported = { $in: filters.gradeLevelsSupported };

    const schoolsQuery = SchoolModel.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [rawSchools, total] = await Promise.all([
      schoolsQuery.exec(),
      performanceMode ? SchoolModel.estimatedDocumentCount() : SchoolModel.countDocuments(query),
    ]);

    const sanitized = rawSchools.map((school) => ({
      ...school,
      _id: String(school._id),
      createdAt: school.createdAt?.toISOString(),
      updatedAt: school.updatedAt?.toISOString(),
    })) as unknown as School[];

    sanitized.forEach((school) => {
      try {
        SchoolZodSchema.parse(school);
      } catch (err) {
        if (err instanceof ZodError) console.error("Zod Validation Error:", err.errors);
      }
    });

    return { schools: sanitized, total };
  } catch (err) {
    Sentry.captureException(err);
    throw new Error(handleServerError(err));
  }
}

/** Create School */
export async function createSchool(
  schoolData: Omit<School, "_id">
): Promise<{ success: boolean; school?: School; error?: string }> {
  try {
    const validated = SchoolZodSchema.omit({ _id: true }).parse(schoolData);
    await connectToDB();
    const created = await SchoolModel.create({
      ...validated,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard/schools");
    return { success: true, school: { ...created.toObject(), _id: created._id.toString() } };
  } catch (err) {
    if (err instanceof ZodError) console.log("Zod validation errors:", err.errors);
    Sentry.captureException(err);
    return { success: false, error: handleServerError(err) };
  }
}

/** Update School */
export async function updateSchool(
  id: string,
  schoolData: Partial<School>
): Promise<{ success: boolean; school?: School; error?: string }> {
  try {
    const validated = validate(SchoolZodSchema.partial(), schoolData);
    if (!validated) throw new Error("Invalid update data");

    await connectToDB();
    const updated = await SchoolModel.findByIdAndUpdate(
      id,
      { ...validated, updatedAt: new Date().toISOString() },
      { new: true }
    );

    if (!updated) throw new Error("School not found");

    revalidatePath("/dashboard/schools");
    return { success: true, school: { ...updated.toObject(), _id: updated._id.toString() } };
  } catch (err) {
    Sentry.captureException(err);
    return { success: false, error: handleServerError(err) };
  }
}

/** Delete School */
export async function deleteSchool(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();
    const deleted = await SchoolModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("School not found");

    revalidatePath("/dashboard/schools");
    return { success: true };
  } catch (err) {
    Sentry.captureException(err);
    return { success: false, error: handleServerError(err) };
  }
}

/** Upload Schools via file */
export const uploadSchoolFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/schools/bulk-upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

    const data = await response.json();
    return `Upload successful! ${data.uploaded} Schools added.`;
  } catch (err) {
    console.error("Error uploading Schools file:", err);
    throw new Error(`Failed to upload Schools file: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};