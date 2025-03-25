"use client";

import { useForm, Path, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodObject, ZodArray, ZodNumber, ZodBoolean, z } from "zod";

import { Fieldset, Legend } from "@components/tailwind/fieldset";
import { renderInputField } from "@components/renderInputField";  // ✅ Import the new function
import FieldConfig, { FieldConfigItem } from "@lib/ui-schema/fieldConfig";
import { Button } from "@components/tailwind/button"; // Import the Tailwind Button component
import renderNestedArrayField from "./renderNestedArray";

interface DynamicFormProps<T extends ZodObject<{ [key: string]: z.ZodTypeAny }>> {
  schema: T;
  onSubmit: (data: z.infer<T>) => void;
  fieldLabels?: Record<string, string>;
  schemaType: keyof typeof FieldConfig; // Assuming FieldConfig is defined elsewhere
  showOptionalFields?: boolean; // ✅ Add a prop to toggle optional fields
}

const generateDefaults = <T extends ZodObject<{ [key: string]: z.ZodTypeAny }>>(
  schema: T,
  schemaType: keyof typeof FieldConfig
): z.infer<T> => {
  const defaults: Partial<z.infer<T>> = {};

  for (const [key, field] of Object.entries(schema.shape)) {
    // const fieldCfg = FieldConfig[schemaType]?.[key];

    // // ✅ 1. Prioritize FieldConfig default
    // if (fieldCfg?.defaultValue !== undefined) {
    //   defaults[key as keyof z.infer<T>] = fieldCfg.defaultValue;
    //   continue;
    // }

    // ✅ 2. Fallback logic based on Zod type
    if (field instanceof ZodNumber) defaults[key as keyof z.infer<T>] = 0 as z.infer<T>[keyof z.infer<T>];
    else if (field instanceof ZodBoolean) defaults[key as keyof z.infer<T>] = false as z.infer<T>[keyof z.infer<T>];
    else if (field instanceof ZodArray) {
      if (field.element instanceof ZodObject) {
        defaults[key as keyof z.infer<T>] = [generateDefaults(field.element, schemaType)] as z.infer<T>[keyof z.infer<T>];
      } else {
        defaults[key as keyof z.infer<T>] = [] as z.infer<T>[keyof z.infer<T>];
      }
    }
    else if (field instanceof ZodObject) {
      defaults[key as keyof z.infer<T>] = generateDefaults(field, schemaType) as z.infer<T>[keyof z.infer<T>];
    }
    else if (field.isOptional()) {
      defaults[key as keyof z.infer<T>] = undefined as z.infer<T>[keyof z.infer<T>];
    }
    else {
      defaults[key as keyof z.infer<T>] = "" as z.infer<T>[keyof z.infer<T>];
    }
  }

  return defaults as z.infer<T>;
};

const DynamicForm = <T extends ZodObject<{ [key: string]: z.ZodTypeAny }>>({
  schema,
  onSubmit,
  fieldLabels = {},
  schemaType,
  showOptionalFields = false, // ✅ Add a prop to toggle optional fields
}: DynamicFormProps<T>) => {

  const defaults = generateDefaults(schema, schemaType);
  console.log("Generated Defaults:", defaults);
  
  const validationResult = schema.safeParse(defaults);
  console.log("Validation Result:", validationResult);

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaults as DefaultValues<z.infer<T>>
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md">
      {Object.entries(schema.shape)
        .filter(([key]) => {
          // const fieldConfig = FieldConfig[schemaType]?.[key];
          const fieldConfig: FieldConfigItem = FieldConfig[schemaType]?.[key] || {
            inputType: "text",
            options: null,
            required: false,
            editable: true,
            placeholder: key,
          };
          return showOptionalFields || fieldConfig?.required;
        })
        .map(([key, field]) => {
          const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

          // console.log("defaults[key as keyof z.infer<T>]", defaults[key as keyof z.infer<T>]);
          return (
            <Fieldset key={key} className="mb-4">
              <Legend>{label}</Legend>
              <div className="mb-2">
                {field instanceof ZodArray && field.element instanceof ZodObject ? (
                  renderNestedArrayField({
                    key,
                    field,
                    register,
                    setValue,
                    watch,
                    generateDefaults,
                    fieldConfig: FieldConfig[schemaType]?.[key],
                    nestedSchemaType: schemaType
                  })
                ) : (
                  renderInputField({
                    schemaType,
                    key,
                    field,
                    control,
                    register,
                    defaultValue: defaults[key as keyof z.infer<T>], 
                  })
                )}
                {errors[key as Path<z.infer<T>>]?.message && (
                  <p className="text-red-500">{errors[key as Path<z.infer<T>>]?.message as string}</p>
                )}
              </div>
            </Fieldset>
          );
        })}
      <Button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</Button> {/* Updated to use Tailwind Button */}
    </form>
  );
};

export default DynamicForm;