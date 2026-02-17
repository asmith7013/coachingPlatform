"use server";

import { ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { ScopeSequenceUnitOrderModel } from "@mongoose-schema/scm/scope-sequence-unit-order/scope-sequence-unit-order.model";
import {
  ScopeSequenceUnitOrderZodSchema,
  ScopeSequenceUnitOrderInputZodSchema,
  ScopeSequenceUnitOrder,
  ScopeSequenceUnitOrderInput,
  UnitOrderItem,
} from "@zod-schema/scm/scope-sequence-unit-order/scope-sequence-unit-order";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

// Interface for lean query results
interface UnitOrderDoc {
  _id: unknown;
  scopeSequenceTag: string;
  units: Array<{
    order: number;
    unitNumber: number;
    unitName: string;
    grade: string;
  }>;
  ownerIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const scopeSequenceUnitOrderCrud = createCrudActions({
  model: ScopeSequenceUnitOrderModel as unknown as Parameters<
    typeof createCrudActions
  >[0]["model"],
  schema: ScopeSequenceUnitOrderZodSchema as ZodType<ScopeSequenceUnitOrder>,
  inputSchema:
    ScopeSequenceUnitOrderInputZodSchema as ZodType<ScopeSequenceUnitOrderInput>,
  name: "ScopeSequenceUnitOrder",
  revalidationPaths: ["/scm/content/lessons"],
  sortFields: ["scopeSequenceTag", "createdAt", "updatedAt"],
  defaultSortField: "scopeSequenceTag",
  defaultSortOrder: "asc",
});

// Export CRUD operations
export const createScopeSequenceUnitOrder = scopeSequenceUnitOrderCrud.create;
export const updateScopeSequenceUnitOrder = scopeSequenceUnitOrderCrud.update;
export const deleteScopeSequenceUnitOrder = scopeSequenceUnitOrderCrud.delete;
export const fetchScopeSequenceUnitOrder = scopeSequenceUnitOrderCrud.fetch;
export const fetchScopeSequenceUnitOrderById =
  scopeSequenceUnitOrderCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

/**
 * Fetch unit order for a specific scope sequence tag
 */
export async function fetchUnitOrderByScopeTag(
  scopeSequenceTag: string,
): Promise<{
  success: boolean;
  data?: UnitOrderItem[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const doc = await ScopeSequenceUnitOrderModel.findOne({
        scopeSequenceTag,
      }).lean<UnitOrderDoc>();

      if (!doc) {
        return {
          success: false,
          error: `No unit order found for ${scopeSequenceTag}`,
        };
      }

      // Sort units by order field and cast to UnitOrderItem
      const units = doc.units
        .sort((a, b) => a.order - b.order)
        .map((u) => ({
          order: u.order,
          unitNumber: u.unitNumber,
          unitName: u.unitName,
          grade: u.grade as UnitOrderItem["grade"],
        }));

      return {
        success: true,
        data: units,
      };
    } catch (error) {
      console.error("Error fetching unit order by scope tag:", error);
      return {
        success: false,
        error: handleServerError(error, "fetchUnitOrderByScopeTag"),
      };
    }
  });
}

/**
 * Upsert unit order for a scope sequence tag
 * Creates if doesn't exist, updates if it does
 */
export async function upsertUnitOrder(
  scopeSequenceTag: string,
  units: UnitOrderItem[],
): Promise<{
  success: boolean;
  data?: ScopeSequenceUnitOrder;
  message?: string;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      // Validate the scope sequence tag
      const validTags = ["Grade 6", "Grade 7", "Grade 8", "Algebra 1"];
      if (!validTags.includes(scopeSequenceTag)) {
        return {
          success: false,
          error: `Invalid scopeSequenceTag: ${scopeSequenceTag}`,
        };
      }

      // Sort units by order before saving
      const sortedUnits = [...units].sort((a, b) => a.order - b.order);

      const result = await ScopeSequenceUnitOrderModel.findOneAndUpdate(
        { scopeSequenceTag },
        {
          $set: {
            units: sortedUnits,
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            scopeSequenceTag,
            ownerIds: [],
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true, new: true, runValidators: true },
      );

      revalidatePath("/scm/content/lessons");

      return {
        success: true,
        data: result.toObject() as unknown as ScopeSequenceUnitOrder,
        message: `Saved unit order for ${scopeSequenceTag} (${sortedUnits.length} units)`,
      };
    } catch (error) {
      console.error("Error upserting unit order:", error);
      return {
        success: false,
        error: handleServerError(error, "upsertUnitOrder"),
      };
    }
  });
}

/**
 * Get all available scope sequence tags that have unit orders defined
 */
export async function getAvailableCurricula(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const tags = (await ScopeSequenceUnitOrderModel.distinct(
        "scopeSequenceTag",
      )) as unknown as string[];
      return {
        success: true,
        data: tags.sort(),
      };
    } catch (error) {
      console.error("Error fetching available curricula:", error);
      return {
        success: false,
        error: handleServerError(error, "getAvailableCurricula"),
      };
    }
  });
}
