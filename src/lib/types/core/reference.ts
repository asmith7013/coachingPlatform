// src/lib/types/core/reference.ts
import { z } from "zod";
import { BaseReferenceZodSchema } from "@zod-schema/core-types/reference";

export type BaseReference = z.infer<typeof BaseReferenceZodSchema>;

// /**
//  * School reference schema and type
//  */
// export const SchoolReferenceZodSchema = BaseReferenceZodSchema.extend({
//   schoolNumber: z.string().optional(),
//   district: z.string().optional(),
// });

// export type SchoolReference = z.infer<typeof SchoolReferenceZodSchema>;

// /**
//  * Staff reference schema and type
//  */
// export const StaffReferenceZodSchema = BaseReferenceZodSchema.extend({
//   email: z.string().email().optional(),
//   role: z.string().optional(),
// });

// export type StaffReference = z.infer<typeof StaffReferenceZodSchema>;
