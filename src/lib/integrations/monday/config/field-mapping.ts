// src/lib/integrations/monday/config/field-mapping.ts

import { MondayFieldMapping } from "@lib/integrations/monday/types/mapping";
import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { SchoolModel } from "@mongoose-schema/core/school.model";
import { TeachingLabStaffModel } from "@mongoose-schema/core/staff.model";
import { formatDateFromMonday } from "@lib/integrations/monday/utils/monday-utils";
// import { formatDateFromMonday } from '@api-monday/utils/monday-utils';

/**
 * Field mappings from Monday.com to our application
 *
 * This configuration maps Monday.com column IDs/titles to
 * our application's field names, with optional transformations.
 *
 * Example mapping:
 * {
 *   "monday_column_id": {
 *     field: "our_field_name",
 *     required: true,
 *     transform: async (value) => transformedValue
 *   }
 * }
 */
export const FIELD_MAPPERS: Record<string, MondayFieldMapping> = {
  // Common Monday column IDs
  person: {
    field: "coach",
    required: true,
    transform: async (value) => {
      // Try to find coach by name in the database
      if (!value) return null;

      const coach = await TeachingLabStaffModel.findOne({
        staffName: { $regex: new RegExp(value, "i") },
      });

      return coach ? coach._id.toString() : null;
    },
  },

  date4: {
    field: "date",
    required: true,
    // Pass through date value
  },

  text0: {
    field: "school",
    required: true,
    transform: async (value) => {
      // Try to find school by name in the database
      if (!value) return null;

      const school = await SchoolModel.findOne({
        schoolName: { $regex: new RegExp(value, "i") },
      });

      return school ? school._id.toString() : null;
    },
  },

  status: {
    field: "modeDone",
    required: false,
    transform: (value) => {
      // Map status values to our enum
      const statusMap: Record<string, string> = {
        Virtual: "Virtual",
        "In-person": "In-person",
        Hybrid: "Hybrid",
      };

      return statusMap[value] || null;
    },
  },

  // Alternative column names (for flexibility)
  "Visit Date": {
    field: "date",
    required: true,
    // Pass through date value
  },

  Coach: {
    field: "coach",
    required: true,
    transform: async (value) => {
      // Try to find coach by name in the database
      if (!value) return null;

      const coach = await TeachingLabStaffModel.findOne({
        staffName: { $regex: new RegExp(value, "i") },
      });

      return coach ? coach._id.toString() : null;
    },
  },

  School: {
    field: "school",
    required: true,
    transform: async (value) => {
      // Try to find school by name in the database
      if (!value) return null;

      const school = await SchoolModel.findOne({
        schoolName: { $regex: new RegExp(value, "i") },
      });

      return school ? school._id.toString() : null;
    },
  },

  Mode: {
    field: "modeDone",
    required: false,
    transform: (value) => {
      // Map status values to our enum
      const statusMap: Record<string, string> = {
        Virtual: "Virtual",
        "In-person": "In-person",
        Hybrid: "Hybrid",
      };

      return statusMap[value] || null;
    },
  },
};

/**
 * Reverse field mappings from our application to Monday.com
 *
 * This configuration is used when syncing data back to Monday.com.
 */
export const REVERSE_FIELD_MAPPERS: Record<
  string,
  {
    mondayColumn: string;
    transform?: (value: unknown) => unknown;
  }
> = {
  date: {
    mondayColumn: "date4",
    transform: (date) => {
      return { date: formatDateFromMonday(date as string) };
    },
  },

  modeDone: {
    mondayColumn: "status",
    transform: (mode) => {
      return { label: mode };
    },
  },

  // Additional field mappings can be added here
};

/**
 * Map Visit entity fields to Monday.com column values
 *
 * This function is used by the sync service to prepare data
 * for updating a Monday.com item.
 *
 * @param visit Visit entity from our database
 * @returns Record of Monday.com column values
 */
export async function mapVisitToMondayFields(
  visit: typeof VisitModel,
): Promise<Record<string, unknown>> {
  const mondayValues: Record<string, unknown> = {};

  // Process each field in the visit that has a reverse mapping
  for (const [fieldName, fieldValue] of Object.entries(visit)) {
    const mapping = REVERSE_FIELD_MAPPERS[fieldName];

    if (mapping && fieldValue !== undefined && fieldValue !== null) {
      if (mapping.transform) {
        // Apply transformation
        const transformedValue = mapping.transform(fieldValue);
        mondayValues[mapping.mondayColumn] = transformedValue;
      } else {
        // Use value directly
        mondayValues[mapping.mondayColumn] = fieldValue;
      }
    }
  }

  return mondayValues;
}
