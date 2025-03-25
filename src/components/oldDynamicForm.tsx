// "use client";

// import { useForm, Controller, Path, DefaultValues } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { ZodObject, ZodEnum, ZodArray, ZodNumber, ZodBoolean, z } from "zod";

// import { Checkbox } from "@components/tailwind/checkbox";
// import { Select } from "@components/tailwind/select";
// import { Input } from "@components/tailwind/input";
// import { Fieldset, Legend } from "@components/tailwind/fieldset";
// import { renderInputField } from "@components/renderInputField";  // ✅ Import the new function

// interface DynamicFormProps<T extends ZodObject<{ [key: string]: z.ZodTypeAny }>> {
//   schema: T;
//   onSubmit: (data: z.infer<T>) => void;
//   fieldLabels?: Record<string, string>;
// }

// const generateDefaults = <T extends ZodObject<{ [key: string]: z.ZodTypeAny }>>(
//   schema: T
// ): z.infer<T> => {
//   const defaults: Partial<z.infer<T>> = {}; // ✅ Explicitly enforce partial structure

//   for (const [key, field] of Object.entries(schema.shape)) {
//     if (field instanceof ZodNumber) defaults[key as keyof z.infer<T>] = 0 as z.infer<T>[keyof z.infer<T>];
//     else if (field instanceof ZodBoolean) defaults[key as keyof z.infer<T>] = false as z.infer<T>[keyof z.infer<T>];
//     else if (field instanceof ZodArray) {
//       // 🛠 If it's an array of objects, initialize with an empty object instead of `[]`
//       if (field.element instanceof ZodObject) {
//         defaults[key as keyof z.infer<T>] = [generateDefaults(field.element)] as z.infer<T>[keyof z.infer<T>];
//       } else {
//         defaults[key as keyof z.infer<T>] = [] as z.infer<T>[keyof z.infer<T>];
//       }
//     }
//     else if (field instanceof ZodObject) defaults[key as keyof z.infer<T>] = generateDefaults(field) as z.infer<T>[keyof z.infer<T>];
//     else if (field.isOptional()) defaults[key as keyof z.infer<T>] = undefined as z.infer<T>[keyof z.infer<T>];
//     else defaults[key as keyof z.infer<T>] = "" as z.infer<T>[keyof z.infer<T>];
//   }

//   return defaults as z.infer<T>; // ✅ Ensure the return type exactly matches `z.infer<T>`
// };


// const DynamicForm = <T extends ZodObject<{ [key: string]: z.ZodTypeAny }>>({
//   schema,
//   onSubmit,
//   fieldLabels = {},
// }: DynamicFormProps<T>) => {

//   const defaults = generateDefaults(schema);
//   console.log("Generated Defaults:", defaults);
  
//   const validationResult = schema.safeParse(defaults);
//   console.log("Validation Result:", validationResult);

//   const {
//     control,
//     handleSubmit,
//     register,
//     setValue,
//     watch,
//     // getValues,
//     formState: { errors },
//   } = useForm<z.infer<T>>({
//     resolver: zodResolver(schema),
//     defaultValues: generateDefaults(schema) as DefaultValues<z.infer<T>>// ✅ Ensures it never throws an error
//   });

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md">
//       {Object.entries(schema.shape).map(([key, field]) => {
//         const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

//         return (
//           <Fieldset key={key} className="mb-4">
//             <Legend>{label}</Legend>
//             <div className="mb-2">
//               {(() => {
//                 // ✅ Boolean (Checkbox)
//                 if (field instanceof ZodBoolean) {
//                   return (
//                     <Controller
//                       control={control}
//                       name={key as Path<z.infer<T>>}
//                       render={({ field }) => (
//                         <Checkbox checked={!!field.value} onChange={field.onChange} />
//                       )}
//                     />
//                   );
//                 }

//                 // ✅ Enum (Dropdown Select)
//                 if (field instanceof ZodEnum) {
//                   const options = field._def.values as string[];
//                   return (
//                     <Controller
//                       control={control}
//                       name={key as Path<z.infer<T>>}
//                       render={({ field }) => (
//                         <Select value={field.value} onChange={(e) => field.onChange(e.target.value)}>
//                           {options.map((option) => (
//                             <option key={option} value={option}>
//                               {option}
//                             </option>
//                           ))}
//                         </Select>
//                       )}
//                     />
//                   );
//                 }

//                 // ✅ Number
//                 if (field instanceof ZodNumber) {
//                   return <Input type="number" {...register(key as Path<z.infer<T>>)} />;
//                 }

//                 if (field instanceof ZodArray && field.element instanceof ZodObject) {
//                   // const arrayValues = watch(key as Path<z.infer<T>>) || [];
//                   const arrayValues = watch(key as Path<z.infer<T>>) as z.infer<T>[typeof key] || [];

//                   return (
//                     <div>
//                       {Array.isArray(arrayValues) ? arrayValues.map((index: number) => (
//                         <div key={index} className="border p-2 space-y-2">
//                           {Object.keys(field.element.shape).map((subKey) => (
//                             <>
//                             <label>{subKey ? fieldLabels[subKey] : 'string'}</label>
//                             <Input
//                               key={subKey}
//                               {...register(`${key}.${index}.${subKey}` as Path<z.infer<T>>)}
//                             />
//                             </>
//                           ))}
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const updatedArray = arrayValues.filter((i : number) => i !== index);
//                               setValue(key as Path<z.infer<T>>, updatedArray as z.infer<T>[typeof key]);
//                             }}
//                             className="bg-red-500 text-white p-1 rounded"
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       )) : null
//                       }
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setValue(key as Path<z.infer<T>>, [...arrayValues, generateDefaults(field.element)] as z.infer<T>[typeof key]);
//                         }}
//                         className="bg-blue-500 text-white p-2 rounded mt-2"
//                       >
//                         Add Item
//                       </button>
//                     </div>
//                   );
//                 }

//                 // ✅ Nested Objects (Render fields inside, instead of full recursion)
//                 if (field instanceof ZodObject) {
//                   return (
//                     <div className="p-2 border rounded">
//                       {Object.entries(field.shape).map(([
//                         subKey, 
//                         // subField
//                       ]) => (
//                         <div key={subKey} className="mb-2">
//                           <label>{subKey}</label>
//                           <Input {...register(`${key}.${subKey}` as Path<z.infer<T>>)} />
//                         </div>
//                       ))}
//                     </div>
//                   );
//                 }

//                 // ✅ Default Text Input (for strings)
//                 return <Input type="text" {...register(key as Path<z.infer<T>>)} />;
//               })()}
//               {errors[key as Path<z.infer<T>>]?.message && (
//                 <p className="text-red-500">{errors[key as keyof z.infer<T>]?.message as string}</p>
//               )}
//             </div>
//           </Fieldset>
//         );
//       })}
//       <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
//     </form>
//   );
// };

// export default DynamicForm;