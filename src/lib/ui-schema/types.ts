import { z } from "zod";

export interface Field<T> {
  key: keyof T;
  label: string;
  type: "text" | "email" | "select" | "multi-select";
  inputType: string;
  options?: string[];
  required: boolean;
  editable: boolean;
  placeholder: string;
  schemaName?: z.ZodTypeAny;
} 