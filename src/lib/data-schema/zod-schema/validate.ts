import { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T | null {
  const validation = schema.safeParse(data);
  return validation.success ? validation.data : null;
}