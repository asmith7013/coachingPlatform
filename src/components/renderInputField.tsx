import { Control, Controller, Path, UseFormRegister } from "react-hook-form";
import { Checkbox } from "@/components/tailwind/checkbox";
import { Select } from "@/components/tailwind/select";
import { Input } from "@/components/tailwind/input";
import FieldConfig, { FieldConfigItem } from "@lib/ui-schema/fieldConfig";
import { z } from "zod";


  
export const renderInputField = <T extends z.ZodTypeAny,>({
    // schemaType,
    key,
    control,
    register,
    defaultValue,
    fieldConfig,
  }: {
    schemaType: keyof typeof FieldConfig;
    key: string;
    field: z.ZodTypeAny;
    control: Control<z.infer<T>>;
    register: UseFormRegister<z.infer<T>>;
    defaultValue?: z.infer<T>[keyof z.infer<T>];
    fieldConfig?: FieldConfigItem;
  }) => {
    

//   console.log("defaultValue", defaultValue, "key", key);
  const config = fieldConfig || {
    inputType: "text",
    options: null,
    required: false,
    editable: true,
    placeholder: key,
  };
  const inputType = config.inputType;
  const options = Array.isArray(config.options) ? config.options : []; // Ensure it's an array
  const placeholder = config.placeholder || key;
  const required = config.required ?? false;
    // ✅ Skip rendering if the field is optional and should be hidden
  if (!required) return null;
    
  switch (inputType) {
    case "multi-select":
      return (
        <Controller
          control={control}
          name={key as Path<T>}
          render={({ field }) => (
            <Select multiple value={field.value || defaultValue} onChange={field.onChange}>
              {options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        />
      );

    case "radio":
      return (
        <Controller
          control={control}
          name={key as Path<T>}
          render={({ field }) => (
            <div className="flex space-x-2">
              {options.map((option: string) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={field.value === option || defaultValue === option}
                    onChange={field.onChange}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}
        />
      );

    case "checkbox":
      return (
        <Controller
          control={control}
          name={key as Path<T>}
          render={({ field }) => (
            <Checkbox checked={!!field.value || defaultValue} onChange={field.onChange} />
          )}
        />
      );

    case "array": // Handles flat arrays as checkboxes
      return (
        <Controller
          control={control}
          name={key as Path<T>}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {options.map((option: string) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(field.value) && field.value.includes(option) || Array.isArray(defaultValue) && defaultValue.includes(option)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(field.value || [], option)]
                        : field.value?.filter((v: string) => v !== option);
                      field.onChange(newValue);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}
        />
      );

    case "number":
      return <Input type="number" placeholder={placeholder} defaultValue={defaultValue} {...register(key as Path<T>)} required={required} />;

    case "date":
      return <Input type="date" placeholder={placeholder} defaultValue={defaultValue} {...register(key as Path<T>)} required={required} />;

    default:
      return <Input type="text" placeholder={placeholder} defaultValue={defaultValue} {...register(key as Path<T>)} required={required} />;
  }
};