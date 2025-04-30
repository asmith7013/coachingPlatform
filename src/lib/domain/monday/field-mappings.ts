// import { findSchoolIdByName, findCoachIdByName } from "@data-utilities/transformers/reference-mappers";
// import { formatDateFromMonday } from "@lib/domain/monday/monday-utils";
import { MondayFieldMapping, MondayColumn } from "@/lib/types/domain/monday";
import { z } from "zod";
import { 
  // GradeLevelsSupportedZod, 
  // ModeDoneZod, 
  AllowedPurposeZod 
} from "@enums";
// import { sanitizeString } from "@data-utilities/transformers/sanitize";

// Define the interface for Monday column descriptions
// interface MondayCoachingPlatformColumnDescription {
//   id: string;
//   title: string;
//   type: string;
// }

/**
 * Enhanced field mappings for Monday.com integration
 * 
 * This mapping system supports:
 * - Required vs optional fields
 * - Multiple column types for each field
 * - Field-specific validation
 * - Custom transformations for complex fields
 */

// Core required fields
export const REQUIRED_FIELD_MAPPINGS: Record<string, MondayFieldMapping> = {
  "date_column": {
    field: "date",
    required: true,
    columnTypes: ["date"],
    validator: z.date(),
    errorMessage: "Visit date is required and must be a valid date",
    transform: (value: string) => {
      const dateValue = value ? new Date(value) : null;
      return dateValue;
    }
  },
  "school_column": {
    field: "school",
    required: true,
    columnTypes: ["text", "dropdown"],
    validator: z.string().min(1),
    errorMessage: "School name is required",
  },
  "coach_column": {
    field: "coach",
    required: true,
    columnTypes: ["people", "text", "dropdown"],
    validator: z.string().or(z.array(z.string())),
    errorMessage: "Coach is required",
    transform: (value: string) => {
      if (Array.isArray(value)) {
        // For people columns that return arrays
        return value.join(", ");
      }
      return value;
    }
  },
};

// Optional fields with validation
export const OPTIONAL_FIELD_MAPPINGS: Record<string, MondayFieldMapping> = {
  "mode_done_column": {
    field: "modeDone",
    required: false,
    columnTypes: ["text", "dropdown"],
    validator: z.string().optional(),
  },
  "purpose_column": {
    field: "allowedPurpose",
    required: false,
    columnTypes: ["text", "dropdown"],
    validator: AllowedPurposeZod.optional(),
    transform: (value: string) => {
      if (!value) return undefined;
      return String(value).trim();
    }
  },
  "grade_levels_column": {
    field: "gradeLevelsSupported",
    required: false,
    columnTypes: ["text", "dropdown", "numbers"],
    validator: z.string().or(z.array(z.string())).or(z.number()).optional(),
    transform: (value: string) => {
      if (!value) return undefined;
      
      // Handle arrays (multi-select dropdowns)
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      
      // Handle numbers
      if (typeof value === "number") {
        return String(value);
      }
      
      return String(value).trim();
    }
  },
  "notes_column": {
    field: "notes",
    required: false,
    columnTypes: ["text", "long_text"],
    validator: z.string().optional(),
  },
};

// Combined mappings for easy access
export const FIELD_MAPPINGS: Record<string, MondayFieldMapping> = {
  ...REQUIRED_FIELD_MAPPINGS,
  ...OPTIONAL_FIELD_MAPPINGS,
};

// List of required fields for validation
export const REQUIRED_FIELDS = Object.keys(REQUIRED_FIELD_MAPPINGS);

/**
 * Helper function to get a mapping by Monday column title
 * Useful when column IDs aren't consistent across boards
 */
export function getMappingByTitle(title: string): MondayFieldMapping | undefined {
  // Common title variations
  const titleMap: Record<string, string> = {
    // Date variations
    "Date": "date_column",
    "Visit Date": "date_column",
    "Session Date": "date_column",
    
    // School variations
    "School": "school_column",
    "School Name": "school_column",
    "Site": "school_column",
    
    // Coach variations
    "Coach": "coach_column",
    "Assigned To": "coach_column",
    "Owner": "coach_column",
    "Person": "coach_column",
    
    // Mode variations
    "Mode": "mode_done_column",
    "Visit Mode": "mode_done_column",
    "Status": "mode_done_column",
    
    // Purpose variations
    "Purpose": "purpose_column",
    "Visit Type": "purpose_column",
    "Type": "purpose_column",
    
    // Grade variations
    "Grades": "grade_levels_column",
    "Grade Levels": "grade_levels_column",
    "Grade": "grade_levels_column",
    
    // Site address variations
    "Address": "notes_column",
    "Location": "notes_column",
    "Site Address": "notes_column",
    
    // End date variations
    "End Date": "date_column",
    "Until": "date_column",
    "Completion Date": "date_column"
  };
  
  const mappingKey = titleMap[title];
  return mappingKey ? FIELD_MAPPINGS[mappingKey] : undefined;
}

/**
 * Detects Monday column types to suggest appropriate field mappings
 */
export const detectFieldMappings = (
  columns: MondayColumn[],
): MondayFieldMapping[] => {
  const mappings: MondayFieldMapping[] = [];

  for (const _column of columns) {
    // Try to match by title first
    const mapping = getMappingByTitle(_column.title);
    if (mapping) {
      mappings.push(mapping);
      return mappings;
    }
    
    // Try to match by column type
    switch (_column.type) {
      case "date":
        // Find the first date mapping that isn't already assigned
        for (const [key, _value] of Object.entries(FIELD_MAPPINGS)) {
          const value = FIELD_MAPPINGS[key];
          if (value.columnTypes?.includes("date") && !mappings.includes(value)) {
            mappings.push(value);
            break;
          }
        }
        break;
        
      case "people":
        if (!mappings.includes(FIELD_MAPPINGS["coach_column"])) {
          mappings.push(FIELD_MAPPINGS["coach_column"]);
        }
        break;
        
      // Add more type matches as needed
    }
  }
  
  return mappings;
} 