import { z } from "zod";

// Cache operation types
export const CacheOperationTypeZodSchema = z.enum([
  'create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'bulkDelete'
]);

export const CacheSyncConfigZodSchema = z.object({
  entityType: z.string().describe("Type of entity being cached"),
  operationType: CacheOperationTypeZodSchema.describe("Type of cache operation"),
  revalidatePaths: z.array(z.string()).optional().describe("Paths to revalidate"),
  additionalInvalidateKeys: z.array(z.unknown()).optional().describe("Additional cache keys to invalidate")
});