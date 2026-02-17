// src/lib/integrations/monday/config/field-mappings.ts

import { z } from "zod";
import { VisitInput } from "@zod-schema/visits/visit";
import {
  GradeLevelsSupportedZod,
  ModeDoneZod,
  AllowedPurposeZod,
  SessionPurposeZod,
  DurationZod,
} from "@enums";
import { MondayColumn } from "@lib/integrations/monday/types/board";
import {
  // GradeLevels,
  AllowedPurposes,
  ModeDone,
} from "@enums";
import { formatDateForAPI } from "@/lib/data-processing/transformers/utils/date-utils";
/**
 * Enhanced field mappings for Monday.com integration with type safety
 *
 * This mapping system supports:
 * - Required vs optional fields
 * - Multiple column types for each field
 * - Field-specific validation with strong typing
 * - Custom transformations for complex fields
 */

// Create a type-safe field mapper type
export type FieldMapper<K extends keyof VisitInput> = {
  field: K;
  required: boolean;
  columnTypes?: string[];
  validator?: z.ZodType<unknown>;
  errorMessage?: string;
  // The transform function is strongly typed to return the exact type for this field
  transform?: (value: string) => VisitInput[K];
};

// Type for all field mappers
export type FieldMappers = {
  [key: string]: FieldMapper<keyof VisitInput>;
};

// Core required fields with proper typing
export const REQUIRED_FIELD_MAPPERS: FieldMappers = {
  date_column: {
    field: "date",
    required: true,
    columnTypes: ["date"],
    validator: z.string(),
    errorMessage: "Date is required",
    transform: (value: string): VisitInput["date"] => value,
  },
  school_column: {
    field: "school",
    required: true,
    columnTypes: ["text", "lookup"],
    validator: z.string(),
    errorMessage: "School is required",
    transform: (value: string): VisitInput["school"] => value,
  },
  coach_column: {
    field: "coach",
    required: true,
    columnTypes: ["people", "text"],
    validator: z.string(),
    errorMessage: "Coach is required",
    transform: (value: string): VisitInput["coach"] => value,
  },
  cycle_column: {
    field: "cycleRef",
    required: true,
    columnTypes: ["text", "lookup"],
    validator: z.string(),
    errorMessage: "Cycle reference is required",
    transform: (value: string): VisitInput["cycleRef"] => value,
  },
  modeDone_column: {
    field: "modeDone",
    required: false,
    columnTypes: ["status", "text", "dropdown"],
    validator: ModeDoneZod,
    errorMessage: "Mode Done must be a valid value",
    transform: (value: string): VisitInput["modeDone"] => {
      // Try to match value to a valid enum option
      const matchedValue = Object.values(ModeDone).find(
        (option: string) => option.toLowerCase() === value.toLowerCase(),
      );

      return (matchedValue as ModeDone) || (value as ModeDone);
    },
  },
  allowed_purpose_column: {
    field: "allowedPurpose",
    required: false,
    columnTypes: ["status", "text", "dropdown"],
    validator: AllowedPurposeZod,
    errorMessage: "Allowed Purpose must be a valid value",
    transform: (value: string): VisitInput["allowedPurpose"] => {
      // Try to match value to a valid enum option
      const matchedValue = Object.values(AllowedPurposes).find(
        (option: string) => option.toLowerCase() === value.toLowerCase(),
      );

      return (matchedValue as AllowedPurposes) || (value as AllowedPurposes);
    },
  },
  grade_levels_column: {
    field: "gradeLevelsSupported",
    required: true,
    columnTypes: ["dropdown", "tags", "text"],
    validator: z.array(GradeLevelsSupportedZod),
    errorMessage: "At least one grade level is required",
    transform: (value: string): VisitInput["gradeLevelsSupported"] => {
      if (!value) return [];
      try {
        if (value.startsWith("[")) {
          // Handle JSON array
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [String(value)];
        }
      } catch {
        // Not valid JSON, continue with string parsing
      }
      return [String(value)];
    },
  },
  owners_column: {
    field: "owners",
    required: false,
    columnTypes: ["people", "text"],
    validator: z.array(z.string()),
    errorMessage: "At least one owner is recommended",
    transform: (value: string): VisitInput["owners"] => {
      if (!value) return [];
      try {
        if (value.startsWith("[")) {
          // Handle JSON array
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [String(value)];
        }
      } catch {
        // Not valid JSON, continue with string parsing
      }
      return [String(value)];
    },
  },
};

// Optional fields with properly typed transforms
export const OPTIONAL_FIELD_MAPPERS: FieldMappers = {
  purpose_column: {
    field: "allowedPurpose",
    required: false,
    columnTypes: ["text", "dropdown"],
    validator: AllowedPurposeZod.optional(),
    transform: (value: string): VisitInput["allowedPurpose"] => {
      if (!value) return undefined;
      const trimmed = String(value).trim();
      const purposes = AllowedPurposeZod.options;
      return purposes.includes(trimmed)
        ? (trimmed as VisitInput["allowedPurpose"])
        : undefined;
    },
  },
  grade_levels_column: {
    field: "gradeLevelsSupported",
    required: false,
    columnTypes: ["text", "dropdown", "numbers"],
    validator: z.array(GradeLevelsSupportedZod),
    transform: (value: string): VisitInput["gradeLevelsSupported"] => {
      if (!value) return ["Grade 6"] as VisitInput["gradeLevelsSupported"];

      try {
        if (value.startsWith("[")) {
          // Handle JSON array
          const parsed = JSON.parse(value);
          return parsed.filter((grade: string) =>
            GradeLevelsSupportedZod.options.includes(grade),
          ) as VisitInput["gradeLevelsSupported"];
        }
      } catch {
        // Not valid JSON, continue with string parsing
      }

      // Handle comma-separated string
      const grades = String(value)
        .split(",")
        .map((g) => g.trim());
      return grades.filter((grade) =>
        GradeLevelsSupportedZod.options.includes(grade),
      ) as VisitInput["gradeLevelsSupported"];
    },
  },
  events_column: {
    field: "events",
    required: false,
    columnTypes: ["text", "long_text"],
    validator: z
      .array(
        z.object({
          eventType: SessionPurposeZod,
          staff: z.array(z.string()),
          duration: DurationZod,
        }),
      )
      .optional(),
    transform: (value: string): VisitInput["events"] => {
      if (!value) return undefined;
      try {
        // Parse JSON from the value
        const parsed = JSON.parse(value);
        // Validate it's an array
        if (!Array.isArray(parsed)) return [];
        // Transform each item to ensure it has the right shape
        const events = parsed.map((item) => ({
          eventType: SessionPurposeZod.options.includes(item.eventType)
            ? item.eventType
            : "observation",
          staff: Array.isArray(item.staff) ? item.staff : [],
          duration: Number(item.duration) || 30,
        }));
        return events as unknown as VisitInput["events"];
      } catch {
        return [];
      }
    },
  },
  session_links_column: {
    field: "sessionLinks",
    required: false,
    columnTypes: ["text", "long_text", "link"],
    validator: z
      .array(
        z.object({
          purpose: z.string(),
          title: z.string(),
          url: z.string(),
          staff: z.array(z.string()),
        }),
      )
      .optional(),
    transform: (value: string): VisitInput["sessionLinks"] => {
      if (!value) return undefined;
      try {
        // Parse JSON from the value
        const parsed = JSON.parse(value);
        // Validate it's an array
        if (!Array.isArray(parsed)) return [];
        // Transform each item to ensure it has the right shape
        return parsed.map((item) => ({
          purpose: item.purpose || "",
          title: item.title || "",
          url: item.url || "",
          staff: Array.isArray(item.staff) ? item.staff : [],
        })) as VisitInput["sessionLinks"];
      } catch {
        // If it's a single link
        if (typeof value === "string" && value.startsWith("http")) {
          return [
            {
              purpose: "Reference",
              title: "Link from Monday",
              url: value,
              staff: [],
            },
          ] as VisitInput["sessionLinks"];
        }
        return [];
      }
    },
  },
  site_address_column: {
    field: "siteAddress",
    required: false,
    columnTypes: ["text", "long_text"],
    validator: z.string().optional(),
    transform: (value: string): VisitInput["siteAddress"] => {
      if (!value) return undefined;
      return String(value).trim();
    },
  },
  end_date_column: {
    field: "endDate",
    required: false,
    columnTypes: ["date"],
    validator: z.string().optional(),
    transform: (value: string): VisitInput["endDate"] => {
      if (!value) return undefined;
      try {
        return formatDateForAPI(value);
      } catch {
        return value;
      }
    },
  },
};

// Combined mappings for easy access
export const FIELD_MAPPERS: FieldMappers = {
  ...REQUIRED_FIELD_MAPPERS,
  ...OPTIONAL_FIELD_MAPPERS,
};

// List of required fields for validation
export const REQUIRED_FIELDS = Object.keys(REQUIRED_FIELD_MAPPERS);

/**
 * Helper function to get a mapping by Monday column title
 */
export function getMappingByTitle(
  title: string,
): FieldMapper<keyof VisitInput> | undefined {
  // Common title variations
  const titleMap: Record<string, string> = {
    // Date variations
    Date: "date_column",
    "Visit Date": "date_column",
    "Session Date": "date_column",

    // School variations
    School: "school_column",
    "School Name": "school_column",
    Site: "school_column",

    // Coach variations
    Coach: "coach_column",
    "Assigned To": "coach_column",
    Owner: "coach_column",
    Person: "coach_column",

    // Cycle variations
    Cycle: "cycle_column",
    Reference: "cycle_column",
    "Cycle Number": "cycle_column",

    // Mode variations
    Mode: "modeDone_column",
    "Visit Mode": "modeDone_column",
    Status: "modeDone_column",

    // Purpose variations
    Purpose: "allowed_purpose_column",
    "Visit Type": "allowed_purpose_column",
    Type: "allowed_purpose_column",

    // Grade variations
    Grades: "grade_levels_column",
    "Grade Levels": "grade_levels_column",
    Grade: "grade_levels_column",

    // Site address variations
    Address: "site_address_column",
    Location: "site_address_column",
    "Site Address": "site_address_column",

    // End date variations
    "End Date": "end_date_column",
    Until: "end_date_column",
    "Completion Date": "end_date_column",

    // Events variations
    Events: "events_column",
    Activities: "events_column",
    Observations: "events_column",

    // Session links variations
    Links: "session_links_column",
    "Session Links": "session_links_column",
    Resources: "session_links_column",

    // Owners variations
    Owners: "owners_column",
    "Team Members": "owners_column",
    Stakeholders: "owners_column",
  };

  const mappingKey = titleMap[title];
  return mappingKey ? FIELD_MAPPERS[mappingKey] : undefined;
}

/**
 * Detects Monday column types to suggest appropriate field mappings
 */
export const detectFieldMappings = (
  columns: MondayColumn[],
): Array<FieldMapper<keyof VisitInput>> => {
  const mappings: Array<FieldMapper<keyof VisitInput>> = [];

  for (const column of columns) {
    // Try to match by title first
    const mapping = getMappingByTitle(column.title);
    if (mapping) {
      mappings.push(mapping);
      continue;
    }

    // Try to match by column type
    switch (column.type) {
      case "date":
        // Find the first date mapping that isn't already assigned
        for (const [_key, mapper] of Object.entries(FIELD_MAPPERS)) {
          if (
            mapper.columnTypes?.includes("date") &&
            !mappings.some((m) => m.field === mapper.field)
          ) {
            mappings.push(mapper);
            break;
          }
        }
        break;

      case "people":
        if (!mappings.some((m) => m.field === "coach")) {
          const coachMapper = FIELD_MAPPERS["coach_column"];
          if (coachMapper) {
            mappings.push(coachMapper);
          }
        }
        break;

      case "text":
        // Try to match text columns with likely corresponding fields
        if (
          column.title.toLowerCase().includes("school") &&
          !mappings.some((m) => m.field === "school")
        ) {
          const schoolMapper = FIELD_MAPPERS["school_column"];
          if (schoolMapper) {
            mappings.push(schoolMapper);
          }
        }
        break;

      // Add more type matches as needed
    }
  }

  return mappings;
};
