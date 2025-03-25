import { UseFormRegister, Path, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { z, ZodArray, ZodObject } from "zod";
import { Input } from "@/components/tailwind/input";
import FieldConfig from "@/lib/ui-schema/fieldConfig";
import { FieldConfigItem } from "@/lib/ui-schema/fieldConfig";

// Define a type for your generateDefaults function.
type GenerateDefaultsFn = <U extends ZodObject<{ [key: string]: z.ZodTypeAny }>>(
  schema: U,
  schemaType: keyof typeof FieldConfig
) => z.infer<U>;

interface RenderNestedArrayFieldProps<T extends ZodObject<{ [key: string]: z.ZodTypeAny }>> {
  key: string;
  field: ZodArray<ZodObject<{ [key: string]: z.ZodTypeAny }>>; // ZodArray where element is a ZodObject
  register: UseFormRegister<z.infer<T>>;
  setValue: UseFormSetValue<z.infer<T>>;
  watch: UseFormWatch<z.infer<T>>;
  generateDefaults: GenerateDefaultsFn;
  fieldConfig?: FieldConfigItem; // Accept fieldConfig
  nestedSchemaType?: keyof typeof FieldConfig; // Optional: use this if the nested array should use a different schema config
}

const renderNestedArrayField = <T extends ZodObject<{ [key: string]: z.ZodTypeAny }>>({
  key,
  field,
  register,
  setValue,
  watch,
  generateDefaults,
  fieldConfig, // Accept fieldConfig
  nestedSchemaType,    // Optional: use this if the nested array should use a different schema config
}: RenderNestedArrayFieldProps<T>) => {
  const items = (watch(key as Path<z.infer<T>>) || []) as z.infer<T>[typeof key]; // Ensure items are typed correctly
  
  return (
    <div className="space-y-4">
      {Array.isArray(items) &&
        items.map((_: unknown, index: number) => (
          <div key={index} className="border p-2 rounded-md">
            {Object.entries(field.element.shape).map(([subKey]) => {
              // Use a type guard to ensure fieldConfig is defined
              const subFieldConfig = (nestedSchemaType
                ? FieldConfig[nestedSchemaType]
                : fieldConfig) as Record<string, FieldConfigItem>;
              // Check if subKey exists in subFieldConfig
              const configItem = subFieldConfig[subKey] || {
                inputType: "text",
                options: null,
                required: false,
                editable: true,
                placeholder: subKey,
              };

              return (
                <div key={subKey} className="mb-2">
                  <label className="block text-sm font-medium">
                    {configItem.placeholder || subKey}
                  </label>
                  <Input
                    {...register(`${key}.${index}.${subKey}` as Path<z.infer<T>>)}
                    placeholder={configItem.placeholder || subKey}
                  />
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => {
                const updated = items.filter((_: unknown, i: number) => i !== index);
                setValue(key as Path<z.infer<T>>, updated);
              }}
              className="bg-red-500 text-white p-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      <button
        type="button"
        onClick={() => {
          const newItem = generateDefaults(field.element, nestedSchemaType || "Rubric");
          setValue(key as Path<z.infer<T>>, [...items, newItem] as z.infer<T>[typeof key]);
        }}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Add Item
      </button>
    </div>
  );
};

export default renderNestedArrayField;