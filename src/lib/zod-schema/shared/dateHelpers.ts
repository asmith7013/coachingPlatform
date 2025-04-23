// import { z } from 'zod';
import { z } from 'zod';

export const zDateField = z.preprocess(
  (val) => (typeof val === 'string' ? new Date(val) : val),
  z.date()
) as z.ZodType<Date, z.ZodTypeDef, string | Date>;