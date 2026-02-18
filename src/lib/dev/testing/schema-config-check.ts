import { ZodObject, ZodRawShape } from "zod";

export function checkFieldConfigCoverage<T extends ZodRawShape>(
  schema: ZodObject<T>,
  config: Record<string, unknown>,
  schemaLabel = "ZodSchema",
  configLabel = "FieldConfig",
): void {
  const schemaFields = Object.keys(schema.shape);
  const configFields = Object.keys(config);

  const missing = schemaFields.filter((field) => !configFields.includes(field));
  const extra = configFields.filter((field) => !schemaFields.includes(field));

  console.group(`🧪 Schema ↔ Config Check: ${schemaLabel} vs ${configLabel}`);
  if (missing.length) {
    console.warn(`🟡 Missing in ${configLabel}:`, missing);
  }
  if (extra.length) {
    console.warn(`⚠️ Extra in ${configLabel}:`, extra);
  }
  if (!missing.length && !extra.length) {
    console.log(`✅ ${schemaLabel} and ${configLabel} are aligned!`);
  }
  console.groupEnd();
}
