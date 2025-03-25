"use server";

import { connectToDB } from "@/lib/db";
import { LookForModel } from "@/models/Mongoose.model";
import { validate } from "@/lib/zod-schema";
import { LookFor, LookForZodSchema } from "@/lib/zod-schema/look-fors/look-for";
// import { RubricZodSchema } from "@/lib/zod-schema/look-fors/rubric";
import { handleServerError } from "@/lib/handleServerError";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import type { SortOrder } from "mongoose";
import mongoose from "mongoose";
// import { z } from "zod";
import { ZodError } from "zod";

// Infer the Rubric type from the Zod schema
// type Rubric = z.infer<typeof RubricZodSchema>;

/**
 * Fetches LookFors with pagination, filtering, and sorting.
 */
export async function fetchLookFors(
    page: number,
    limit: number,
    filters: object,
    sortBy: { [key: string]: SortOrder } = { createdAt: -1 },
    performanceMode: boolean = false
): Promise<{ lookFors: LookFor[]; total: number }> {
    try {
        await connectToDB();

        // ✅ Use default sorting if none provided
        const sortOptions: { [key: string]: SortOrder } = Object.keys(sortBy).length > 0 ? sortBy : { createdAt: -1 };

        const query = LookForModel.find(filters)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Use lean queries to avoid circular references

        const [lookFors, total] = await Promise.all([
            query.exec(),
            performanceMode 
                ? LookForModel.estimatedDocumentCount() // ✅ Faster but less precise
                : LookForModel.countDocuments(filters)  // ✅ Slower but more precise
        ]);

        // Handle circular references in the response
        const sanitizedLookFors = lookFors.map(lookFor => ({
            ...lookFor,
            _id: String(lookFor._id), // Ensure _id is a string
            createdAt: lookFor.createdAt ? new Date(lookFor.createdAt).toISOString() : "",
            updatedAt: lookFor.updatedAt ? new Date(lookFor.updatedAt).toISOString() : "",
            owners: lookFor.owners?.map((owner: mongoose.Types.ObjectId) => owner.toString()),
            teachers: lookFor.teachers?.map((teacher: mongoose.Types.ObjectId) => teacher.toString()),
            schools: lookFor.schools?.map((school: mongoose.Types.ObjectId) => school.toString()),
            lookForIndex: lookFor.lookForIndex,
            topic: lookFor.topic,
            description: lookFor.description,
            studentFacing: lookFor.studentFacing,
            rubric: lookFor.rubric
        })) as unknown as LookFor[];

        // Validate the sanitizedLookFors against the LookFor Zod schema
        sanitizedLookFors.forEach(lookFor => {
            try {
                LookForZodSchema.parse(lookFor); // Validate each LookFor object
            } catch (error) {
                if (error instanceof ZodError) {
                    console.error("Validation Error for LookFor:", error.errors);
                }
            }
        });

        // console.log("🔍 sanitizedLookFors", sanitizedLookFors);
        // console.log("🔍 total", total);
        return { lookFors: sanitizedLookFors, total };
    } catch (err) {
        console.error("Error in fetchLookFors:", err); // Log the error
        Sentry.captureException(err);
                // Enhanced error handling
        if (err instanceof mongoose.Error) {
            // Handle Mongoose-specific errors
            console.error("Mongoose error:", err.message);
            throw new Error(`Database error: ${err.message}`);
        } else if (err instanceof Error) {
            // Handle generic errors
            console.error("Error fetching LookFors:", err.message);
            throw new Error(`Error fetching LookFors: ${err.message}`);
        } else {
            // Handle unexpected errors
            console.error("Unexpected error:", err);
            throw new Error("An unexpected error occurred while fetching LookFors.");
        }
        
    }
}

/**
 * Creates a new LookFor entry with Zod validation.
 */
export async function createLookFor(newLookFor: Omit<LookFor, "_id">): Promise<{ success: boolean; lookFor?: LookFor; error?: string }> {    
    try {
        // console.log("🔍 Input data for validation:", newLookFor);

        // Validate the input data against the Zod schema
        const validatedData = LookForZodSchema.omit({ _id: true }).parse(newLookFor); // Use parse to throw on validation failure
        // console.log("🔍 validatedData", validatedData);
        await connectToDB();
        // console.log("🔍 validatedData after connectToDB", validatedData);
        const createdLookFor = await LookForModel.create({
            ...validatedData,
            _id: new mongoose.Types.ObjectId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const sanitizedLookFor = {
            ...createdLookFor.toObject(),
            _id: createdLookFor._id.toString(), // ✅ Ensure _id is a string
        };
        // console.log("🔍 createdLookFor after create", createdLookFor);
        revalidatePath("/dashboard/lookForList"); // ✅ Ensures UI re-fetches data
        return { success: true, lookFor: sanitizedLookFor };
    } catch (err) {
        if (err instanceof ZodError) {
            // Log specific validation errors
            console.log("🔍 Zod validation errors:", err.errors);
        } else {
            console.log("🔍 Error:", err);
        }
        // console.log("🔍 Invalid data:", newLookFor);
        Sentry.captureException(err);
        // throw new Error(handleServerError(err));
        return { success: false, error: handleServerError(err) };
    }
}

/**
 * Updates a LookFor by ID with Zod validation.
 */
export async function updateLookFor(id: string, updatedLookFor: Partial<LookFor>): Promise<{ success: boolean; lookFor?: LookFor; error?: string }> {
    try {
        // Validate the partial update data
        const validatedData = validate(LookForZodSchema.partial(), updatedLookFor);
        
        if (!validatedData) {
            throw new Error("Invalid LookFor update data");
        }

        await connectToDB();
        const updatedItem = await LookForModel.findByIdAndUpdate(
            id, 
            { ...validatedData, updatedAt: new Date().toISOString() }, 
            { new: true }
        );

        if (!updatedItem) {
            throw new Error("LookFor not found.");
        }

        revalidatePath("/dashboard/lookFors"); // ✅ Ensures UI re-fetches data
        return { success: true, lookFor: { ...updatedItem.toObject(), _id: updatedItem._id.toString() } };
    } catch (err) {
        Sentry.captureException(err); // ✅ Log error to Sentry
        // throw new Error(handleServerError(err)); // ✅ Centralized error handling
        return { success: false, error: handleServerError(err) }; // ✅ Centralized error handling
    }
}

/**
 * Deletes a LookFor by ID.
 */
export async function deleteLookFor(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await connectToDB();

        const deletedItem = await LookForModel.findByIdAndDelete(id);
        if (!deletedItem) {
            return { success: false, error: `LookFor with ID ${id} not found.` };
        }

        revalidatePath("/dashboard/lookFors"); // ✅ Ensures UI re-fetches data
        return { success: true };
    } catch (err) {
        Sentry.captureException(err);
        return { success: false, error: handleServerError(err) };
    }
}

/**
 * Upload LookFors via file.
 */
export const uploadLookForFile = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/lookFors/bulk-upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return `Upload successful! ${data.uploaded} LookFors added.`;
    } catch (err) {
        console.error("Error uploading LookFors file:", err);
        throw new Error(`Failed to upload LookFors file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};