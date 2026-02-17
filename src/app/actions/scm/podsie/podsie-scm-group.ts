"use server";

import { ZodType } from "zod";
import { PodsieScmGroupModel } from "@mongoose-schema/scm/podsie/podsie-scm-group.model";
import {
  PodsieScmGroupZodSchema,
  PodsieScmGroupInputZodSchema,
  PodsieScmGroup,
  PodsieScmGroupInput,
} from "@zod-schema/scm/podsie/podsie-scm-group";
import { createCrudActions } from "@server/crud/crud-factory";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const podsieScmGroupCrud = createCrudActions({
  model: PodsieScmGroupModel as unknown as Parameters<
    typeof createCrudActions
  >[0]["model"],
  schema: PodsieScmGroupZodSchema as ZodType<PodsieScmGroup>,
  inputSchema: PodsieScmGroupInputZodSchema as ZodType<PodsieScmGroupInput>,
  name: "PodsieScmGroup",
  revalidationPaths: ["/scm/podsie/module-config"],
  sortFields: ["podsieGroupId", "createdAt", "updatedAt"],
  defaultSortField: "podsieGroupId",
  defaultSortOrder: "asc",
});

export const createPodsieScmGroup = podsieScmGroupCrud.create;
export const updatePodsieScmGroup = podsieScmGroupCrud.update;
export const deletePodsieScmGroup = podsieScmGroupCrud.delete;
export const fetchPodsieScmGroups = podsieScmGroupCrud.fetch;
export const fetchPodsieScmGroupById = podsieScmGroupCrud.fetchById;
