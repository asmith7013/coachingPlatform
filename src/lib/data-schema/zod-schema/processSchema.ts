// import { z } from "zod";

/**
 * Processes a Zod schema and identifies its fields and nested schemas.
 * @param schema - The Zod schema to analyze.
 * @returns A structured representation of the schema, including field types and nested schemas.
 */
// export function processSchema(schema: z.ZodObject<any>) {
//   const schemaData = schema.shape;
  
//   // Identify nested schemas
//   const nestedSchemas: string[] = [];
//   const processedSchema: Record<string, string> = {};

//   Object.entries(schemaData).forEach(([key, value]) => {
//     // Type assertion to specify that value is of type z.ZodTypeAny
//     const zodValue = value as z.ZodTypeAny;

//     if (zodValue instanceof z.ZodArray && zodValue._def.type instanceof z.ZodObject) {
//       // ✅ If the field is an array of a ZodObject, it's a nested schema
//       nestedSchemas.push(key);
//       processedSchema[key] = "NestedSchemaArray";
//     } else if (zodValue instanceof z.ZodObject) {
//       // ✅ If it's a direct ZodObject, it's a nested schema
//       nestedSchemas.push(key);
//       processedSchema[key] = "NestedSchema";
//     } else {
//       // ✅ Otherwise, just store its type
//       processedSchema[key] = zodValue._def.typeName;
//     }
//   });

//   return {
//     fields: processedSchema,
//     nestedSchemas,
//   };
// }