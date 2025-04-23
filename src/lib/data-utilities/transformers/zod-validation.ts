import { ZodSchema, ZodError } from "zod";

/**
 * Validates data against a given Zod schema.
 * Logs errors and ensures a valid fallback response.
 *
 * @param schema - The Zod schema to validate against.
 * @param data - The object to be validated.
 * @returns {T} - The validated object or an empty fallback if validation fails.
 */
export function validateWithZod<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data); // ✅ Validates data against schema
    } catch (error) {
        if (error instanceof ZodError) {
            console.error("Zod Validation Error:", error.errors);
        } else {
            console.error("Unexpected Validation Error:", error);
        }
        throw new Error("Invalid data structure received.");
    }
}