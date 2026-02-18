import { StaffModel } from "@mongoose-schema/core/staff.model";
import {
  StaffZodSchema,
  StaffInputZodSchema,
  Staff,
} from "@zod-schema/core/staff";
import { ZodType } from "zod";
import { createCrudActions } from "@server/crud";

export const staffActions = createCrudActions({
  model: StaffModel,
  schema: StaffZodSchema as ZodType<Staff>,
  inputSchema: StaffInputZodSchema,
  name: "Staff",
  revalidationPaths: ["/dashboard/staff"],
  sortFields: ["staffName", "email", "createdAt", "updatedAt"],
  defaultSortField: "staffName",
});
