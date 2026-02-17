// src/lib/api/validation/parse-query.ts
import { z } from "zod";
import { validateStrict } from "@/lib/data-processing/validation/zod-validation";

/**
 * Validates and transforms URL query parameters using a Zod schema
 *
 * This utility handles the conversion from the standard Next.js searchParams object
 * to a properly typed and validated object that can be used in API routes and server actions.
 *
 * @param searchParams - The URL search parameters (from Next.js)
 * @param schema - A Zod schema to validate and transform the parameters
 * @returns The validated and transformed parameters
 */
export const parseQueryParams = <T>(
  searchParams: { [key: string]: string | string[] },
  schema: z.ZodType<T>,
): T => {
  // Convert string[] values to string by taking first value
  const normalizedParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  // Parse with Zod schema
  // return schema.parse(normalizedParams);
  return validateStrict(schema, normalizedParams);
};
