import { z } from "zod";
import { Rubric } from "@/lib/zod-schema";

export interface Field<T> {
  key: keyof T;
  label: string;
  inputType: string;
  options?: string[];
  required: boolean;
  editable: boolean;
  placeholder: string;
  schemaName?: z.ZodType<Rubric>;
} 